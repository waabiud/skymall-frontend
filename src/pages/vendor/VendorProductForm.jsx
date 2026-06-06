import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { vendorAPI, productsAPI } from '../../api/endpoints';
import CloudinaryUpload from '../../components/common/CloudinaryUpload';
import api from '../../api/axios';

const VendorProductForm = () => {
  const navigate  = useNavigate();
  const { slug }  = useParams();
  const isEditing = Boolean(slug);

  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [productSlug, setProductSlug] = useState(slug || null);
  const [imageUrl,   setImageUrl]   = useState(null);
  const [imageSaved, setImageSaved] = useState(false);

  const [form, setForm] = useState({
    name:          '',
    slug:          '',
    description:   '',
    category:      '',
    price:         '',
    discount:      '0',
    stock:         '',
    condition:     'new',
    is_active:     true,
    is_featured:   false,
    is_flash_sale: false,
  });

  useEffect(() => {
    productsAPI.getCategories().then((res) => setCategories(res.data));
    if (isEditing) {
      setLoading(true);
      vendorAPI.getProducts()
        .then((res) => {
          const products = res.data.results || res.data;
          const product  = products.find((p) => p.slug === slug);
          if (product) {
            setForm({
              name:          product.name          || '',
              slug:          product.slug          || '',
              description:   product.description   || '',
              category:      product.category?.id  || '',
              price:         product.price         || '',
              discount:      product.discount      || '0',
              stock:         product.stock         || '',
              condition:     product.condition     || 'new',
              is_active:     product.is_active     ?? true,
              is_featured:   product.is_featured   || false,
              is_flash_sale: product.is_flash_sale || false,
            });
            if (product.primary_image) setImageUrl(product.primary_image);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [slug, isEditing]);

  const handleNameChange = (e) => {
    const name     = e.target.value;
    const autoSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    setForm({ ...form, name, slug: autoSlug });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleImageUpload = async (url) => {
    setImageUrl(url);
    // if product already exists, save image immediately
    if (productSlug && url) {
      try {
        await api.post(`/products/manage/${productSlug}/images/`, {
          image_url:  url,
          is_primary: true,
        });
        setImageSaved(true);
        toast.success('Image saved');
      } catch {
        // image will be saved after product creation
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.stock || !form.category) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price:    parseFloat(form.price),
        discount: parseFloat(form.discount) || 0,
        stock:    parseInt(form.stock),
        category: parseInt(form.category),
      };

      let savedSlug = productSlug;

      if (isEditing) {
        await vendorAPI.updateProduct(slug, payload);
        toast.success('Product updated');
      } else {
        const res = await vendorAPI.createProduct(payload);
        savedSlug = res.data.slug || form.slug;
        setProductSlug(savedSlug);
        toast.success('Product created');
      }

      // save image if not already saved
      if (imageUrl && !imageSaved && savedSlug) {
        try {
          await api.post(`/products/manage/${savedSlug}/images/`, {
            image_url:  imageUrl,
            is_primary: true,
          });
        } catch (err) {
          console.error('Image save failed:', err);
        }
      }

      navigate('/vendor/products');
    } catch (err) {
      const errors = err.response?.data;
      if (typeof errors === 'object') {
        Object.entries(errors).forEach(([key, val]) => {
          toast.error(`${key}: ${Array.isArray(val) ? val[0] : val}`);
        });
      } else {
        toast.error('Failed to save product');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-pulse space-y-4">
      <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-xl w-40" />
      <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/vendor/products"
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <FiArrowLeft size={20} className="dark:text-white" />
        </Link>
        <h1 className="font-heading text-2xl font-bold dark:text-white">
          {isEditing ? 'Edit Product' : 'Add New Product'}
        </h1>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="space-y-4">

        {/* Product Image */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
                        dark:border-gray-800 p-6">
          <h2 className="font-heading font-semibold dark:text-white mb-4">
            Product Image
          </h2>
          <CloudinaryUpload
            onUpload={handleImageUpload}
            currentImage={imageUrl}
            label="Main product image"
          />
          {imageUrl && (
            <p className="text-xs text-green-600 mt-2">
              Image ready — will be saved with product
            </p>
          )}
        </div>

        {/* Basic info */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
                        dark:border-gray-800 p-6 space-y-4">
          <h2 className="font-heading font-semibold dark:text-white">
            Basic Information
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700
                              dark:text-gray-300 mb-1">
              Product Name <span className="text-danger">*</span>
            </label>
            <input type="text" name="name" value={form.name}
              onChange={handleNameChange} required
              placeholder="e.g. Samsung Galaxy A55"
              className="w-full px-4 py-3 rounded-xl border border-gray-200
                         dark:border-gray-700 bg-gray-50 dark:bg-gray-800
                         dark:text-white text-sm focus:outline-none
                         focus:ring-2 focus:ring-primary" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700
                              dark:text-gray-300 mb-1">
              Slug (auto-generated)
            </label>
            <input type="text" name="slug" value={form.slug}
              onChange={handleChange} placeholder="samsung-galaxy-a55"
              className="w-full px-4 py-3 rounded-xl border border-gray-200
                         dark:border-gray-700 bg-gray-50 dark:bg-gray-800
                         dark:text-gray-400 text-sm focus:outline-none
                         focus:ring-2 focus:ring-primary font-mono" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700
                              dark:text-gray-300 mb-1">
              Category <span className="text-danger">*</span>
            </label>
            <select name="category" value={form.category}
              onChange={handleChange} required
              className="w-full px-4 py-3 rounded-xl border border-gray-200
                         dark:border-gray-700 bg-gray-50 dark:bg-gray-800
                         dark:text-white text-sm focus:outline-none
                         focus:ring-2 focus:ring-primary">
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700
                              dark:text-gray-300 mb-1">
              Description <span className="text-danger">*</span>
            </label>
            <textarea name="description" value={form.description}
              onChange={handleChange} required rows={5}
              placeholder="Describe your product in detail..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200
                         dark:border-gray-700 bg-gray-50 dark:bg-gray-800
                         dark:text-white text-sm focus:outline-none
                         focus:ring-2 focus:ring-primary resize-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700
                              dark:text-gray-300 mb-1">
              Condition
            </label>
            <div className="flex gap-2">
              {['new', 'used', 'refurbished'].map((c) => (
                <button key={c} type="button"
                  onClick={() => setForm({ ...form, condition: c })}
                  className={`flex-1 py-2 rounded-xl border text-sm font-medium
                              capitalize transition
                    ${form.condition === c
                      ? 'bg-primary text-white border-primary'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
                        dark:border-gray-800 p-6 space-y-4">
          <h2 className="font-heading font-semibold dark:text-white">
            Pricing & Stock
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700
                                dark:text-gray-300 mb-1">
                Price (KES) <span className="text-danger">*</span>
              </label>
              <input type="number" name="price" value={form.price}
                onChange={handleChange} required min={0} step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-3 rounded-xl border border-gray-200
                           dark:border-gray-700 bg-gray-50 dark:bg-gray-800
                           dark:text-white text-sm focus:outline-none
                           focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700
                                dark:text-gray-300 mb-1">
                Discount (%)
              </label>
              <input type="number" name="discount" value={form.discount}
                onChange={handleChange} min={0} max={100} step="0.01"
                placeholder="0"
                className="w-full px-4 py-3 rounded-xl border border-gray-200
                           dark:border-gray-700 bg-gray-50 dark:bg-gray-800
                           dark:text-white text-sm focus:outline-none
                           focus:ring-2 focus:ring-primary" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700
                              dark:text-gray-300 mb-1">
              Stock Quantity <span className="text-danger">*</span>
            </label>
            <input type="number" name="stock" value={form.stock}
              onChange={handleChange} required min={0} placeholder="0"
              className="w-full px-4 py-3 rounded-xl border border-gray-200
                         dark:border-gray-700 bg-gray-50 dark:bg-gray-800
                         dark:text-white text-sm focus:outline-none
                         focus:ring-2 focus:ring-primary" />
          </div>

          {form.price && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Price Preview</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="font-bold text-primary text-lg">
                  KES {(form.price - (form.price * form.discount / 100)).toLocaleString()}
                </span>
                {form.discount > 0 && (
                  <>
                    <span className="text-sm text-gray-400 line-through">
                      KES {Number(form.price).toLocaleString()}
                    </span>
                    <span className="text-xs bg-danger/10 text-danger px-2 py-0.5 rounded-lg">
                      -{form.discount}% OFF
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Visibility */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
                        dark:border-gray-800 p-6">
          <h2 className="font-heading font-semibold dark:text-white mb-4">Visibility</h2>
          <div className="space-y-3">
            {[
              { name: 'is_active',     label: 'Active',
                desc: 'Product is visible in the shop' },
              { name: 'is_featured',   label: 'Featured',
                desc: 'Show in featured products section' },
              { name: 'is_flash_sale', label: 'Flash Sale',
                desc: 'Show in flash sale section' },
            ].map((toggle) => (
              <label key={toggle.name}
                className="flex items-center justify-between p-3 rounded-xl border
                           border-gray-200 dark:border-gray-700 cursor-pointer
                           hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                <div>
                  <p className="text-sm font-medium dark:text-white">{toggle.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{toggle.desc}</p>
                </div>
                <div onClick={() => setForm({ ...form, [toggle.name]: !form[toggle.name] })}
                  className={`w-11 h-6 rounded-full transition cursor-pointer
                    ${form[toggle.name] ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform
                                  mt-0.5 mx-0.5
                    ${form[toggle.name] ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <Link to="/vendor/products"
            className="flex-1 py-3 border border-gray-200 dark:border-gray-700
                       text-gray-700 dark:text-gray-300 font-semibold rounded-xl
                       hover:bg-gray-50 dark:hover:bg-gray-800 transition
                       text-center text-sm">
            Cancel
          </Link>
          <button type="submit" disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary
                       text-white font-semibold rounded-xl hover:bg-blue-600 transition
                       disabled:opacity-60 text-sm">
            <FiSave size={16} />
            {saving ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </motion.form>
    </div>
  );
};

export default VendorProductForm;
