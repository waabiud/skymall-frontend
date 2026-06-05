import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSave, FiUpload, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { vendorAPI, productsAPI } from '../../api/endpoints';

const VendorProductForm = () => {
  const navigate        = useNavigate();
  const { slug }        = useParams();
  const isEditing       = Boolean(slug);
  const fileInputRef    = useRef(null);

  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [images,     setImages]     = useState([]);
  const [dragOver,   setDragOver]   = useState(false);

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

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    try {
      const res     = await vendorAPI.getProduct(slug);
      const product = res.data;
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
      if (product.images?.length) {
        setImages(product.images.map((img) => ({
          file:     null,
          preview:  img.image || img,
          existing: true,
        })));
      }
    } catch {
      toast.error('Failed to load product');
      navigate('/vendor/products');
    } finally {
      setLoading(false);
    }
  }, [slug, navigate]);

  useEffect(() => {
    productsAPI.getCategories().then((res) => {
      const data = res.data;
      setCategories(Array.isArray(data) ? data : data.results || []);
    });

    if (isEditing) {
      fetchProduct();
    }
  }, [isEditing, fetchProduct]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img.file) URL.revokeObjectURL(img.preview);
      });
    };
  }, [images]);

  const addFiles = (files) => {
    const valid = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (!valid.length) { toast.error('Please select image files only'); return; }
    if (images.length + valid.length > 5) {
      toast.error('Maximum 5 images allowed'); return;
    }
    const newImages = valid.map((file) => ({
      file,
      preview:  URL.createObjectURL(file),
      existing: false,
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const handleFileInput = (e) => addFiles(e.target.files);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const removeImage = (index) => {
    setImages((prev) => {
      const img = prev[index];
      if (img.file) URL.revokeObjectURL(img.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.stock || !form.category) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      const payload = new FormData();
      payload.append('name',          form.name);
      payload.append('slug',          form.slug);
      payload.append('description',   form.description);
      payload.append('category',      parseInt(form.category));
      payload.append('price',         parseFloat(form.price));
      payload.append('discount',      parseFloat(form.discount) || 0);
      payload.append('stock',         parseInt(form.stock));
      payload.append('condition',     form.condition);
      payload.append('is_active',     form.is_active);
      payload.append('is_featured',   form.is_featured);
      payload.append('is_flash_sale', form.is_flash_sale);

      images.forEach((img) => {
        if (img.file) payload.append('images', img.file);
      });

      if (isEditing) {
        await vendorAPI.updateProduct(slug, payload);
        toast.success('Product updated successfully');
      } else {
        await vendorAPI.createProduct(payload);
        toast.success('Product created successfully');
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

        {/* Basic Info */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
                        dark:border-gray-800 p-6 space-y-4">
          <h2 className="font-heading font-semibold dark:text-white">Basic Information</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Product Name <span className="text-danger">*</span>
            </label>
            <input type="text" name="name" value={form.name}
              onChange={handleNameChange} required
              placeholder="e.g. Samsung Galaxy A55"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700
                         bg-gray-50 dark:bg-gray-800 dark:text-white text-sm focus:outline-none
                         focus:ring-2 focus:ring-primary" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Slug (auto-generated)
            </label>
            <input type="text" name="slug" value={form.slug}
              onChange={handleChange}
              placeholder="samsung-galaxy-a55"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700
                         bg-gray-50 dark:bg-gray-800 dark:text-gray-400 text-sm focus:outline-none
                         focus:ring-2 focus:ring-primary font-mono" />
            <p className="text-xs text-gray-400 mt-1">Used in the product URL</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category <span className="text-danger">*</span>
            </label>
            <select name="category" value={form.category}
              onChange={handleChange} required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700
                         bg-gray-50 dark:bg-gray-800 dark:text-white text-sm focus:outline-none
                         focus:ring-2 focus:ring-primary">
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description <span className="text-danger">*</span>
            </label>
            <textarea name="description" value={form.description}
              onChange={handleChange} required rows={5}
              placeholder="Describe your product in detail..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700
                         bg-gray-50 dark:bg-gray-800 dark:text-white text-sm focus:outline-none
                         focus:ring-2 focus:ring-primary resize-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Condition
            </label>
            <div className="flex gap-2">
              {['new', 'used', 'refurbished'].map((c) => (
                <button key={c} type="button"
                  onClick={() => setForm({ ...form, condition: c })}
                  className={`flex-1 py-2 rounded-xl border text-sm font-medium capitalize transition
                    ${form.condition === c
                      ? 'bg-primary text-white border-primary'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
                        dark:border-gray-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-semibold dark:text-white">Product Images</h2>
            <span className="text-xs text-gray-400">{images.length}/5</span>
          </div>

          {images.length < 5 && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition
                ${dragOver
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5'}`}>
              <FiUpload size={24} className="text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Drag & drop images here
              </p>
              <p className="text-xs text-gray-400 mt-1">or click to browse — up to 5 images</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileInput}
                className="hidden" />
            </div>
          )}

          {images.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {images.map((img, index) => (
                <div key={index} className="relative group aspect-square">
                  <img
                    src={img.preview}
                    alt={`preview-${index}`}
                    className="w-full h-full object-cover rounded-xl border border-gray-200
                               dark:border-gray-700" />
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 bg-primary text-white
                                     text-xs px-1.5 py-0.5 rounded-md font-medium">
                      Main
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full
                               flex items-center justify-center opacity-0 group-hover:opacity-100
                               transition shadow">
                    <FiX size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {images.length > 0 && (
            <p className="text-xs text-gray-400">
              First image will be used as the main product image. Hover to remove.
            </p>
          )}
        </div>

        {/* Pricing & Stock */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
                        dark:border-gray-800 p-6 space-y-4">
          <h2 className="font-heading font-semibold dark:text-white">Pricing & Stock</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Price (KES) <span className="text-danger">*</span>
              </label>
              <input type="number" name="price" value={form.price}
                onChange={handleChange} required min={0} step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700
                           bg-gray-50 dark:bg-gray-800 dark:text-white text-sm focus:outline-none
                           focus:ring-2 focus:ring-primary" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Discount (%)
              </label>
              <input type="number" name="discount" value={form.discount}
                onChange={handleChange} min={0} max={100} step="0.01"
                placeholder="0"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700
                           bg-gray-50 dark:bg-gray-800 dark:text-white text-sm focus:outline-none
                           focus:ring-2 focus:ring-primary" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Stock Quantity <span className="text-danger">*</span>
            </label>
            <input type="number" name="stock" value={form.stock}
              onChange={handleChange} required min={0}
              placeholder="0"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700
                         bg-gray-50 dark:bg-gray-800 dark:text-white text-sm focus:outline-none
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
                  <span className="text-sm text-gray-400 line-through">
                    KES {Number(form.price).toLocaleString()}
                  </span>
                )}
                {form.discount > 0 && (
                  <span className="text-xs bg-danger/10 text-danger px-2 py-0.5 rounded-lg">
                    -{form.discount}% OFF
                  </span>
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
              { name: 'is_active',     label: 'Active',     desc: 'Product is visible in the shop' },
              { name: 'is_featured',   label: 'Featured',   desc: 'Show in featured products section' },
              { name: 'is_flash_sale', label: 'Flash Sale', desc: 'Show in flash sale section' },
            ].map((toggle) => (
              <label key={toggle.name}
                className="flex items-center justify-between p-3 rounded-xl border
                           border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50
                           dark:hover:bg-gray-800 transition">
                <div>
                  <p className="text-sm font-medium dark:text-white">{toggle.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{toggle.desc}</p>
                </div>
                <div className="relative">
                  <input type="checkbox" name={toggle.name}
                    checked={form[toggle.name]}
                    onChange={handleChange}
                    className="sr-only" />
                  <div onClick={() => setForm({ ...form, [toggle.name]: !form[toggle.name] })}
                    className={`w-11 h-6 rounded-full transition cursor-pointer
                      ${form[toggle.name] ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform
                                    mt-0.5 mx-0.5 ${form[toggle.name] ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <Link to="/vendor/products"
            className="flex-1 py-3 border border-gray-200 dark:border-gray-700 text-gray-700
                       dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50
                       dark:hover:bg-gray-800 transition text-center text-sm">
            Cancel
          </Link>
          <button type="submit" disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-white
                       font-semibold rounded-xl hover:bg-blue-600 transition disabled:opacity-60 text-sm">
            <FiSave size={16} />
            {saving ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </motion.form>
    </div>
  );
};

export default VendorProductForm;