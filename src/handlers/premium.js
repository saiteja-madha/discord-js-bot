const { getUser } = require("@schemas/User");

/**
 * Verifica se o usuário tem premium ativo
 * @param {import('discord.js').User} user 
 * @returns {Promise<boolean>}
 */
async function isPremiumUser(user) {
  try {
    const userDb = await getUser(user);
    
    if (!userDb.premium.isActive) return false;
    
    // Verifica se o premium expirou
    if (userDb.premium.expiresAt && new Date() > userDb.premium.expiresAt) {
      userDb.premium.isActive = false;
      userDb.premium.expiresAt = null;
      await userDb.save();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Erro ao verificar premium:", error);
    return false;
  }
}

/**
 * Ativa premium para um usuário
 * @param {import('discord.js').User} user 
 * @param {number} days 
 */
async function activatePremium(user, days = 30) {
  const userDb = await getUser(user);
  const now = new Date();
  
  userDb.premium.isActive = true;
  userDb.premium.activatedAt = now;
  userDb.premium.expiresAt = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
  
  await userDb.save();
  return userDb;
}

module.exports = {
  isPremiumUser,
  activatePremium,
};