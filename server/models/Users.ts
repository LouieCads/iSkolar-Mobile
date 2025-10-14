import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database"; // We'll create this below

interface UserAttributes {
  id: string;
  email: string;
  password: string;
  role?: 'admin' | 'student' | 'sponsor';
  hasSelectedRole?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Required Fields
interface UserCreationAttributes extends Optional<UserAttributes, "id"> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public password!: string;
  public role?: 'admin' | 'student' | 'sponsor';
  public hasSelectedRole?: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'student', 'sponsor'),
      allowNull: true,
    },
    hasSelectedRole: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
  }
);

export default User;
