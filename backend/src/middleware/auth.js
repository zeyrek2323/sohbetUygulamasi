// Basit dummy auth middleware (herkesi giriş yapmış varsayar)
module.exports = (req, res, next) => {
  req.user = { _id: '60d21b4667d0d8992e610c85' }; // Geçerli bir ObjectId formatı
  next();
}; 