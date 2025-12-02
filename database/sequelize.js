import { Sequelize, DataTypes } from 'sequelize'

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './db.sqlite',
  logging: false
})

export const Metric = sequelize.define(
  'Metric',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    timestamp: {
      type: DataTypes.STRING,
      allowNull: false
    },
    cpu: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    mem_used: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    mem_total: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    disk_used: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    disk_total: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    disk_use_percent: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    disk_read_bytes: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    disk_write_bytes: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    disk_io_wait: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    net_rx: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    net_tx: {
      type: DataTypes.FLOAT,
      allowNull: false
    }
  },
  {
    tableName: 'metrics',
    timestamps: false
  }
)
