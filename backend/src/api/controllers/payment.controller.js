"use strict";
const db = require("../../models/index.js");
const { Sequelize, Op } = require("sequelize");

const createPaymentMethod = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const { type, provider, metadata, is_default, user_id } = req.body;

    if (!type || !provider || !user_id) {
      await t.rollback();
      return res.status(400).json({
        error: "Faltan campos obligatorios: type, provider, user_id.",
      });
    }

    if (type.includes("CARD") && metadata && metadata.cardNumber) {
      const existingMethod = await db.PaymentMethod.findOne({
        where: Sequelize.literal(
          `"metadata"->>'cardNumber' = '${metadata.cardNumber}' AND "user_id" = '${user_id}'`
        ),
        transaction: t,
      });

      if (existingMethod) {
        await t.rollback();
        return res.status(409).json({
          error:
            "Ya existe un método de pago con esta tarjeta para este usuario.",
        });
      }
    }

    if (is_default === true) {
      await db.PaymentMethod.update(
        { is_default: false },
        {
          where: {
            user_id: user_id,
            is_default: true,
          },
          transaction: t,
        }
      );
    }

    const paymentMethod = await db.PaymentMethod.create(
      { type, provider, metadata, is_default, user_id },
      { transaction: t }
    );

    await t.commit();
    res.status(201).json(paymentMethod);
  } catch (error) {
    await t.rollback();
    console.error("Error al crear método de pago:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        error:
          "Conflicto: Ya existe un método de pago con datos únicos similares.",
      });
    }
    res.status(500).json({
      error:
        error.message || "Error interno del servidor al crear método de pago.",
    });
  }
};

const getAllPaymentMethods = async (req, res) => {
  try {
    const methods = await db.PaymentMethod.findAll();
    if (methods.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron métodos de pago en el sistema." });
    }
    res.json(methods);
  } catch (error) {
    console.error("Error al obtener todos los métodos de pago:", error);
    res
      .status(500)
      .json({
        error:
          error.message ||
          "Error interno del servidor al obtener todos los métodos de pago.",
      });
  }
};

const getUserPaymentMethods = async (req, res) => {
  try {
    const { user_id } = req.params;

    const methods = await db.PaymentMethod.findAll({ where: { user_id } });

    if (methods.length === 0) {
      return res.status(404).json({
        message: "No se encontraron métodos de pago para este usuario.",
      });
    }
    res.json(methods);
  } catch (error) {
    console.error("Error al obtener métodos de pago del usuario:", error);
    res.status(500).json({
      error:
        error.message ||
        "Error interno del servidor al obtener métodos de pago.",
    });
  }
};

const updatePaymentMethod = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const { id } = req.params;
    const { metadata, is_default, user_id } = req.body;

    if (user_id !== undefined) {
      const existingMethodOwner = await db.PaymentMethod.findByPk(id, {
        attributes: ["user_id"],
        transaction: t,
      });
      if (existingMethodOwner && existingMethodOwner.user_id !== user_id) {
        await t.rollback();
        return res.status(403).json({
          error:
            "No se permite cambiar el usuario asociado a un método de pago.",
        });
      }
    }

    if (
      req.body.type &&
      req.body.type.includes("CARD") &&
      metadata &&
      metadata.cardNumber
    ) {
      const currentMethodInfo = await db.PaymentMethod.findByPk(id, {
        attributes: ["user_id"],
        transaction: t,
      });
      if (currentMethodInfo) {
        const existingMethod = await db.PaymentMethod.findOne({
          where: {
            [Op.and]: [
              Sequelize.literal(
                `"metadata"->>'cardNumber' = '${metadata.cardNumber}'`
              ),
              { user_id: currentMethodInfo.user_id },
              { id: { [Op.ne]: id } },
            ],
          },
          transaction: t,
        });

        if (existingMethod) {
          await t.rollback();
          return res.status(409).json({
            error:
              "Ya existe otro método de pago con esta tarjeta para este usuario.",
          });
        }
      }
    }

    if (is_default === true) {
      const methodToUpdate = await db.PaymentMethod.findByPk(id, {
        attributes: ["user_id"],
        transaction: t,
      });
      if (methodToUpdate) {
        await db.PaymentMethod.update(
          { is_default: false },
          {
            where: {
              user_id: methodToUpdate.user_id,
              is_default: true,
              id: { [Op.ne]: id },
            },
            transaction: t,
          }
        );
      }
    }

    const [updatedRowsCount, updatedPaymentMethods] =
      await db.PaymentMethod.update(req.body, {
        where: { id },
        returning: true,
        transaction: t,
      });

    if (updatedRowsCount === 0) {
      await t.rollback();
      return res.status(404).json({
        message: "Método de pago no encontrado o no se realizaron cambios.",
      });
    }

    await t.commit();
    res.json(updatedPaymentMethods[0]);
  } catch (error) {
    await t.rollback();
    console.error("Error al actualizar método de pago:", error);
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        error:
          "Conflicto: Los datos proporcionados (ej. tarjeta) ya existen en otro método de pago para este usuario.",
      });
    }
    res.status(500).json({
      error:
        error.message ||
        "Error interno del servidor al actualizar método de pago.",
    });
  }
};

const deletePaymentMethod = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const { id } = req.params;

    const deleted = await db.PaymentMethod.destroy({
      where: { id },
      transaction: t,
    });
    if (deleted) {
      await t.commit();
      return res
        .status(200)
        .json({ message: "Método de pago eliminado correctamente." });
    }
    await t.rollback();
    return res.status(404).json({ message: "Método de pago no encontrado." });
  } catch (error) {
    await t.rollback();
    console.error("Error al eliminar método de pago:", error);
    res.status(500).json({
      error:
        error.message ||
        "Error interno del servidor al eliminar método de pago.",
    });
  }
};

module.exports = {
  createPaymentMethod,
  getAllPaymentMethods,
  getUserPaymentMethods,
  updatePaymentMethod,
  deletePaymentMethod,
};
