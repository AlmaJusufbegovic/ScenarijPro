const { Sequelize} = require("sequelize");
const bcrypt = require('bcrypt');

const sequelize = new Sequelize(
    process.env.DB_NAME || "wt26",
    process.env.DB_USER || "root",
    process.env.DB_PASSWORD || "",
    { 
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT || 3306,
        dialect: "mysql",
        logging: false,
        // retry logika jer MySQL kontejner treba par sekundi da se pokrene
        pool: {
            max: 5,
            min: 0,
            acquire: 60000,
            idle: 10000
        }
    }
);

const Scenario = sequelize.define("Scenario", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, {
    timestamps: false 
});

const Line = sequelize.define("Line", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    lineId: { 
        type: Sequelize.INTEGER, 
        allowNull: false
    }, 
    text: {
        type: Sequelize.STRING,
        allowNull: false, 
        defaultValue: ""
    },
    nextLineId: {
        type: Sequelize.INTEGER,
        allowNull: true 
    }
}, {
    timestamps: false 
});

const Delta = sequelize.define("Delta", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    type: {
        type: Sequelize.STRING, 
        allowNull: false
    },
    lineId: {
        type: Sequelize.INTEGER,
        allowNull: true 
    },
    nextLineId: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    content: {
        type: Sequelize.STRING, 
        allowNull: true
    },
    oldName: {
        type: Sequelize.STRING, 
        allowNull: true
    },
    newName: {
        type: Sequelize.STRING, 
        allowNull: true
    },
    timestamp: {
        type: Sequelize.INTEGER, 
        allowNull: false
    }
}, {
    timestamps: false 
});

const Checkpoint = sequelize.define("Checkpoint", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    timestamp: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
}, {
    timestamps: false 
});

const User = sequelize.define("User", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fullName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true, 
        validate: {
            isEmail: true 
        }
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    notifFrequency: {
        type: Sequelize.STRING,
        allowNull: true
    }
}, {
    timestamps: true,
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
            const salt = await bcrypt.genSalt(10, 'a');
            user.password = await bcrypt.hash(user.password, salt);
        }
    },
        beforeUpdate:async (user) => {
            if (user.password) {
            const salt = await bcrypt.genSalt(10, 'a');
            user.password = await bcrypt.hash(user.password, salt);
        }
  }
 }
});

const UserScenario = sequelize.define("UserScenario", {
    id: { 
        type: Sequelize.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    role: { 
        type: Sequelize.STRING, 
        defaultValue: "owner" 
    }
}, { 
    timestamps: false 
});

Scenario.hasMany(Line, { foreignKey: 'scenarioId', onDelete: 'CASCADE' });
Line.belongsTo(Scenario, { foreignKey: 'scenarioId' });

Scenario.hasMany(Delta, { foreignKey: 'scenarioId', onDelete: 'CASCADE' });
Delta.belongsTo(Scenario, { foreignKey: 'scenarioId' });

Scenario.hasMany(Checkpoint, { foreignKey: 'scenarioId', onDelete: 'CASCADE' });
Checkpoint.belongsTo(Scenario, { foreignKey: 'scenarioId' });

User.belongsToMany(Scenario, { through: UserScenario, foreignKey: 'userId' });
Scenario.belongsToMany(User, { through: UserScenario, foreignKey: 'scenarioId' });

module.exports = {
    sequelize,
    Scenario,
    Line,
    Delta,
    Checkpoint,
    User,
    UserScenario
};
