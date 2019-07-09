module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    name: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: true
    },
    password: DataTypes.STRING
  }, {
      timestamps: true,
    })
  User.associate = models => {
    User.hasMany(models.Order, {
      as: "orders",
      foreignKey: "user_id"
    })
    User.hasMany(models.Group, {
      as: "groups",
      foreignKey: "user_id"
    })
  }
  return User;
}
