const { Router } = require("express");
const axios = require("axios");
const { Sequelize } = require("sequelize");
const { UserInfo, Restaurants, Categories, Evaluations } = require("..//db");
require("dotenv").config();

const router = Router();

router.post("/signup", async (req, res) => {
  const { email } = req.body;
  try {
    const [newuser, boolean] = await UserInfo.findOrCreate({
      where: {
        email,
      },
    });
    return res.status(200).json(newuser);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.get("/user/:email", async (req, res) => {
  const { email } = req.params;
  try {
    const user = await UserInfo.findOne({
      where: { email: email },
    });
    if (user) {
      // console.log("esto es user", user);
      return res.status(200).json(user);
    }
    return res.status(400).json("There is no such user!");
  } catch (error) {
    res.status(400).json(error);
  }
});

router.post("/newrestaurant", async (req, res) => {
  const { image, categoryId, name, latitude, longitude } = req.body;
  try {
    const newRest = Restaurants.build({
      image,
      categoryId,
      name,
      latitude,
      longitude,
    });
    await newRest.save();
    return res.status(200).json(newRest);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.post("/addcategory", async (req, res) => {
  const { name } = req.body;
  try {
    const newCategory = Categories.build({
      name,
    });
    await newCategory.save();
    return res.status(200).json(newCategory);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.get("/restaurants", async (req, res) => {
  try {
    const allRest = await Restaurants.findAll({
      include: [{ model: Categories }],
    });

    return res.status(200).json(allRest);
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

router.post("/user/:id/newevaluation", async (req, res) => {
  const { id } = req.params;
  const { restaurantId, comment, score } = req.body;
  try {
    const newEvaluation = Evaluations.build({
      userId: id,
      restaurantId,
      comment,
      score,
    });
    await newEvaluation.save();
    return res.status(200).json(newEvaluation);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.get("/evaluations/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const allEvaluations = await Evaluations.findAll({
      where: { restaurantId: id },
    });
    return res.status(200).json(allEvaluations);
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

router.get("/score/:restaurantId", async (req, res) => {
  const restaurantId = req.params.restaurantId;

  try {
    const promedio = await Evaluations.findAll({
      attributes: [[Sequelize.fn("AVG", Sequelize.col("score")), "score"]],
      where: {
        restaurantId: restaurantId,
      },
    });

    if (promedio) {
      res.json(promedio);
    } else {
      res.status(404).json({ error: "Restaurante no encontrado" });
    }
  } catch (error) {
    console.error("Error al obtener el promedio de las evaluaciones:", error);
    res
      .status(500)
      .json({ error: "Error al obtener el promedio de las evaluaciones" });
  }
});

module.exports = router;
