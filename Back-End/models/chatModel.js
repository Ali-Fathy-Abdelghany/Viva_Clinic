// models/ChatMessage.js
module.exports = (sequelize, DataTypes) => {
  const ChatMessage = sequelize.define('ChatMessage', {
    // Unique Room Identifier (e.g., 'P1_D5' or 'D5_P1')
    // This simplifies grouping messages between a specific patient and doctor pair.
    roomId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    
    // The ID of the generic User (from the 'User' table) who sent the message
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      // The actual foreign key constraint should be set up in the User model association
    },

    // Foreign Key to the Patient entity
    patientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      // Defined as an attribute; the association is handled in the `associate` function
    },

    // Foreign Key to the Doctor entity
    doctorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      // Defined as an attribute; the association is handled in the `associate` function
    },

    // The actual message content
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    }
    // Sequelize automatically adds 'id', 'createdAt', and 'updatedAt'
  });

  // Define associations to enable JOINs in the controller
  ChatMessage.associate = function(models) {
    // Links to the Patient table
    ChatMessage.belongsTo(models.Patient, {
      foreignKey: 'patientId',
      as: 'patient'
    });

    // Links to the Doctor table
    ChatMessage.belongsTo(models.Doctor, {
      foreignKey: 'doctorId',
      as: 'doctor'
    });
    
    // Links to the generic User table (to identify the sender's role/details)
    ChatMessage.belongsTo(models.User, {
      foreignKey: 'senderId',
      as: 'sender'
    });
  };

  return ChatMessage;
};
