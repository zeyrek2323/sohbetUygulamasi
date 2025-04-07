const Category = require('../models/category.model');

// Tüm kategorileri getir
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true });
        res.json(categories);
    } catch (error) {
        res.status(500).json({
            message: 'Kategoriler getirilirken hata oluştu',
            error: error.message
        });
    }
};

// Belirli bir kategoriyi getir
exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Kategori bulunamadı' });
        }
        res.json(category);
    } catch (error) {
        res.status(500).json({
            message: 'Kategori getirilirken hata oluştu',
            error: error.message
        });
    }
};

// Yeni kategori oluştur
exports.createCategory = async (req, res) => {
    try {
        const { name, description, topics, generalInfo, imageUrl } = req.body;

        const category = new Category({
            name,
            description,
            topics,
            generalInfo,
            imageUrl
        });

        await category.save();
        res.status(201).json({
            message: 'Kategori başarıyla oluşturuldu',
            category
        });
    } catch (error) {
        res.status(500).json({
            message: 'Kategori oluşturulurken hata oluştu',
            error: error.message
        });
    }
};

// Kategori güncelle
exports.updateCategory = async (req, res) => {
    try {
        const { name, description, topics, generalInfo, imageUrl, isActive } = req.body;
        
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            {
                name,
                description,
                topics,
                generalInfo,
                imageUrl,
                isActive
            },
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({ message: 'Kategori bulunamadı' });
        }

        res.json({
            message: 'Kategori başarıyla güncellendi',
            category
        });
    } catch (error) {
        res.status(500).json({
            message: 'Kategori güncellenirken hata oluştu',
            error: error.message
        });
    }
};

// Kategori sil (soft delete)
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!category) {
            return res.status(404).json({ message: 'Kategori bulunamadı' });
        }

        res.json({
            message: 'Kategori başarıyla silindi',
            category
        });
    } catch (error) {
        res.status(500).json({
            message: 'Kategori silinirken hata oluştu',
            error: error.message
        });
    }
};

// Kategori konularını getir
exports.getCategoryTopics = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Kategori bulunamadı' });
        }
        res.json(category.topics);
    } catch (error) {
        res.status(500).json({
            message: 'Kategori konuları getirilirken hata oluştu',
            error: error.message
        });
    }
}; 