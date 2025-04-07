const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Kategori adı zorunludur'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Kategori açıklaması zorunludur']
    },
    imageUrl: {
        type: String,
        default: 'default-category.png'
    },
    topics: [{
        type: String,
        trim: true
    }],
    generalInfo: {
        type: String,
        required: [true, 'Kategori hakkında genel bilgi zorunludur']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Kategori adını küçük harfe çevirme
categorySchema.pre('save', function(next) {
    this.name = this.name.toLowerCase();
    next();
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category; 