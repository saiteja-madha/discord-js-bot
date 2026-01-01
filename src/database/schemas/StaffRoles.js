// StaffRoles.js

const mongoose = require('mongoose');

const staffRolesSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  roles: { type: [String], default: [] }
});

const StaffRoles = mongoose.model('StaffRoles', staffRolesSchema);

module.exports = StaffRoles;