const { Product, Category } = require("../models");
const shortid = require("shortid");
const slugify = require("slugify");
const cloudinary = require("cloudinary");

exports.addProduct = (req, res) => {
  const { name, price, description, category, quantity } = req.body;
  let productPictures = [];

  if (req.files.length > 0) {
    productPictures = req.files.map((file) => {
      return { img: file.path };
    });
  }
  const product = new Product({
    name: name,
    slug: `${slugify(name)}-${shortid.generate()}`,
    price,
    description,
    productPictures,
    quantity,
    category,
  });
  product.save((error, product) => {
    if (error) return res.status(400).json({ error });
    if (product) {
      res.status(201).json({ product, files: req.files });
    } else {
      res.status(400).json({ error: "something went wrong" });
    }
  });
};

exports.getProductById = (req, res) => {
  const { _id } = req.body;
  if (_id) {
    Product.findOne({ _id, isDisabled: { $ne: true } })
      .populate({ path: "category", select: "_id name categoryImage" })
      .exec((error, product) => {
        if (error) return res.status(400).json({ error });
        if (product) {
          res.status(200).json({ product });
        } else {
          res.status(400).json({ error: "something went wrong" });
        }
      });
  } else {
    res.status(400).json({ error: "Params required" });
  }
};

// Update Product -- Admin
exports.updateProduct = async (req, res, next) => {
  let product = await Product.findOne({ slug: req.params.slug });
  if (!product) {
    return next(new ErrorHander("Product not found", 404));
  }

  let productPictures = [];

  if (req.files.length > 0) {
    productPictures = req.files.map((file) => {
      return { img: file.path };
    });
  }
  console.log(productPictures);

  if (productPictures !== undefined) {
    // Deleting Images From Cloudinary
    for (let i = 0; i < product.productPictures.length; i++) {
      const public_id = product.productPictures[i].img
        .split("/")
        .pop()
        .split(".")[0];
      await cloudinary.v2.uploader.destroy(public_id);
    }
  }
  req.body.productPictures = productPictures;
  let updatedProduct = await Product.findOneAndUpdate(
    { _id: product._id },
    req.body,
    {
      new: true,
    }
  );
  if (updatedProduct) {
    res.status(200).json({ updatedProduct });
  } else {
    res.status(400).json({ error: "update failt" });
  }
};

exports.updateQty = (req, res) => {
  const { productId, sizeProductId, quantity } = req.body;
  Product.findOne({ _id: productId }).exec((error, product) => {
    if (error) return res.status(400).json({ error });
    const sizeMatch = product.sizes.find(
      (sizeProduct) => sizeProduct._id == sizeProductId
    );
    if (sizeMatch) {
      sizeMatch.quantity = quantity;
      product.save((error, product) => {
        if (error) return res.status(400).json({ error });
        if (product) {
          res.status(202).json({ product });
        } else {
          res.status(400).json({ error: "something went wrong" });
        }
      });
    }
  });
};

exports.getProductDetailsBySlug = (req, res) => {
  const { slug } = req.params;
  if (slug) {
    Product.findOne({ slug, isDisabled: { $ne: true } })
      .populate({ path: "category", select: "_id name categoryImage" })
      .populate("reviews")
      .populate({
        path: "reviews",
        populate: {
          path: "user",
          select: "_id name profilePicture",
        },
      })
      .exec((error, product) => {
        if (error) return res.status(400).json({ error });
        if (product) {
          res.status(200).json({ product });
        } else {
          res.status(400).json({ error: "something went wrong" });
        }
      });
  } else {
    res.status(400).json({ error: "Params required" });
  }
};

exports.deleteProductById = (req, res) => {
  const { productId } = req.body;
  if (productId) {
    Product.updateOne({ _id: productId }, { isDisabled: true }).exec(
      (error, result) => {
        if (error) return res.status(400).json({ error });
        if (result) {
          res.status(202).json({ result });
        } else {
          res.status(400).json({ error: "something went wrong" });
        }
      }
    );
  } else {
    return res.status(400).json({ error: "Params required" });
  }
};

exports.enableProductById = (req, res) => {
  const { productId } = req.body;
  if (productId) {
    Product.updateOne({ _id: productId }, { isDisabled: false }).exec(
      (error, result) => {
        if (error) return res.status(400).json({ error });
        if (result) {
          res.status(202).json({ result });
        } else {
          res.status(400).json({ error: "something went wrong" });
        }
      }
    );
  } else {
    return res.status(400).json({ error: "Params required" });
  }
};

exports.deleteProductByCateId = (req, res) => {
  const { _id } = req.body;
  if (_id) {
    Product.updateMany({ category: _id }, { isDisabled: true }).exec(
      (error, result) => {
        if (error) return res.status(400).json({ error });
        if (result) {
          res.status(202).json({ result });
        } else {
          res.status(400).json({ error: "something went wrong" });
        }
      }
    );
  } else {
    return res.status(400).json({ error: "Params required" });
  }
};

exports.enableProductByCateId = (req, res) => {
  const { _id } = req.body;
  if (_id) {
    Product.updateMany({ category: _id }, { isDisabled: false }).exec(
      (error, result) => {
        if (error) return res.status(400).json({ error });
        if (result) {
          res.status(202).json({ result });
        } else {
          res.status(400).json({ error: "something went wrong" });
        }
      }
    );
  } else {
    return res.status(400).json({ error: "Params required" });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({ isDisabled: { $ne: true } })
      .populate({ path: "category", select: "_id name categoryImage" })
      .limit(100)
      .exec();

    if (products) {
      res.status(200).json({ products });
    } else {
      res.status(400).json({ error: "something went wrong" });
    }
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.getProductsDisable = async (req, res) => {
  try {
    const products = await Product.find({ isDisabled: { $eq: true } })
      .populate({ path: "category", select: "_id name categoryImage" })
      .limit(100)
      .exec();

    if (products) {
      res.status(200).json({ products });
    } else {
      res.status(400).json({ error: "something went wrong" });
    }
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.getProductByCategory = (req, res) => {
  const { categoryId } = req.params;
  if (categoryId) {
    Product.find({
      category: { $eq: categoryId },
      isDisabled: { $ne: true },
    }).exec((error, product) => {
      if (error) return res.status(400).json({ error });
      if (product) {
        res.status(200).json({ product });
      } else {
        res.status(400).json({ error: "something went wrong" });
      }
    });
  } else {
    res.status(400).json({ error: "Params required" });
  }
};

exports.searchByProductName = async (req, res) => {
  const { text } = req.body;
  const products = await Product.find({
    $text: { $search: text },
    isDisabled: { $ne: true },
  })
    .populate({ path: "category", select: "_id name categoryImage" })
    .populate({ path: "brand", select: "_id name brandImage" })
    .populate("sizes")
    .populate({
      path: "sizes",
      populate: {
        path: "size",
        select: "_id size description",
      },
    })
    .exec();
  res.status(200).json({ products, title: `Kết quả tìm kiếm: ${text}` });
};

exports.addProductReview = (req, res) => {
  const { rating, comment, productId } = req.body;
  Product.findOneAndUpdate(
    { _id: productId, "reviews.user": { $ne: req.user._id } },
    {
      $push: {
        reviews: [{ rating, comment, user: req.user._id }],
      },
    }
  ).exec((error, result) => {
    if (error) return res.status(400).json({ error });
    if (result) {
      res.status(202).json({ message: "update successfully" });
    } else {
      res.status(400).json({ error: "something went wrong" });
    }
  });
};

// Example update status product
// db.Owners.update({ _id: req.params.id },{"$set":{"active":false}})
//   .then(dbModel => res.json(dbModel))
//   .catch(err => res.status(422).json(err));
//  },
