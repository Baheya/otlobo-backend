module.exports = (sequelize, DataTypes) => {
    const Restaurant = sequelize.define("Restaurant", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        name: DataTypes.STRING,
        adress: DataTypes.STRING,
        password: DataTypes.STRING
    }, {
    timestamps: true,
    })
    return Restaurant;
}
