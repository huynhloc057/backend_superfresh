const { Category, Product } = require("../models");
const slugify = require("slugify");
const shortid = require("shortid");
const { deleteProductByCateId } = require("./product");

const createCategories = (categories) => {
  const categoryList = [];

  for (let cat of categories) {
    categoryList.push({
      _id: cat._id,
      name: cat.name,
      slug: cat.slug,
    });
  }
  return categoryList;
};

exports.addCategory = (req, res) => {
  const { name } = req.body;

  const categoryObj = {
    name,
    slug: `${slugify(name)}-${shortid.generate()}`,
  };

  let categoryPictures = [];

  if (req.files.length > 0) {
    categoryPictures = req.files.map((file) => {
      return { img: file.path };
    });
    categoryObj.categoryImage = [...categoryPictures];
  }

  const cate = new Category(categoryObj);
  cate.save((error, category) => {
    if (error) {
      return res.status(400).json({ error });
    }
    if (category) {
      return res.status(201).json({ category });
    }
  });
};

exports.getCategories = (req, res) => {
  Category.find({ isDisabled: { $ne: true } }).exec((error, categories) => {
    if (error) {
      return res.status(400).json({ error });
    } else {
      return res.status(200).json({ categories });
    }
  });
};

exports.getCategoryById = (req, res) => {
  const { _id } = req.body;
  if (_id) {
    Category.findOne({ _id, isDisabled: { $ne: true } }).exec(
      (error, category) => {
        if (error) return res.status(400).json({ error });
        if (category) {
          res.status(200).json({ category });
        } else {
          res.status(400).json({ error: "something went wrong" });
        }
      }
    );
  } else {
    res.status(400).json({ error: "Params required" });
  }
};

exports.getDisabledCategories = (req, res) => {
  Category.find({ isDisabled: { $eq: true } }).exec((error, categories) => {
    if (error) {
      return res.status(400).json({ error });
    } else {
      const categoriesList = createCategories(categories);
      return res.status(200).json({ categories: categoriesList });
    }
  });
};

exports.deleteCategoryById = (req, res) => {
  const { _id } = req.body;
  if (_id) {
    Category.updateOne({ _id }, { isDisabled: true }).exec((error, result) => {
      if (error) return res.status(400).json({ error });
      if (result) {
        res.status(202).json({ result });
      } else {
        res.status(400).json({ error: "something went wrong" });
      }
    });
  } else {
    return res.status(400).json({ error: "Params required" });
  }
};

exports.enableCategoryById = (req, res) => {
  const { _id } = req.body;
  if (_id) {
    Category.updateOne({ _id }, { isDisabled: false }).exec((error, result) => {
      if (error) return res.status(400).json({ error });
      if (result) {
        res.status(202).json({ result });
      } else {
        res.status(400).json({ error: "something went wrong" });
      }
    });
  } else {
    return res.status(400).json({ error: "Params required" });
  }
};

exports.updateCategories = async (req, res) => {
  const { _id, name } = req.body;
  const category = {
    name,
  };

  await Category.findOneAndUpdate({ _id }, category, {
    new: true,
  });
  res.status(202).json({ message: "Category updated successfully" });
};
