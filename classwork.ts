import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Підключено до MongoDB');
}).catch(err => {
    console.error('Не вдалося підключитися до MongoDB', err);
});

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    type: { type: String, required: true },
    manufacturer: { type: String, required: false }
});

const Product = mongoose.model('Product', productSchema);

app.get('/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: 'Не вдалося отримати комплектуючі' });
    }
});

app.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Комплектуюче не знайдено' });
        }
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: 'Помилка при отриманні комплектуючого' });
    }
});

app.post('/products', async (req, res) => {
    const { name, price, type, manufacturer } = req.body;

    if (!name || typeof price !== 'number' || !type) {
        return res.status(400).json({ message: 'Назва, ціна і тип є обов’язковими полями' });
    }

    const newProduct = new Product({ name, price, type, manufacturer });
    try {
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: 'Не вдалося додати комплектуюче', error: err.message });
    }
});

app.patch('/products/:id', async (req, res) => {
    const { price } = req.body;

    if (typeof price !== 'number' || price <= 0) {
        return res.status(400).json({ message: 'Ціна має бути додатнім числом' });
    }

    try {
        const formattedPrice = parseFloat(price.toFixed(2));
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { price: formattedPrice },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Комплектуюче не знайдено' });
        }

        res.json(updatedProduct);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Не вдалося оновити комплектуюче' });
    }
});

app.put('/products/:id', async (req, res) => {
    const { price } = req.body;

    if (typeof price !== 'number' || price <= 0) {
        return res.status(400).json({ message: 'Ціна має бути додатнім числом' });
    }

    try {
        const formattedPrice = parseFloat(price.toFixed(2));
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { price: formattedPrice },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Комплектуюче не знайдено' });
        }

        res.json(updatedProduct);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Не вдалося оновити комплектуюче' });
    }
});

app.delete('/products/:id', async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);

        if (!deletedProduct) {
            return res.status(404).json({ message: 'Комплектуюче не знайдено' });
        }

        res.json({ message: 'Комплектуюче успішно видалено', product: deletedProduct });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Не вдалося видалити комплектуюче' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Сервер працює на порту ${PORT}`);
});
