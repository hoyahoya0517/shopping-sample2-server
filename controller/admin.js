import * as adminRepository from "../data/admin.js";
import * as productRepository from "../data/product.js";
import * as authRepository from "../data/auth.js";
import * as orderRepository from "../data/order.js";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import dayjs from "dayjs";

dayjs.locale("ko");
dotenv.config();

export async function getAdminProduct(req, res) {
  const query = req.query;
  const q = query.q;
  const searchFilter = query.searchFilter;
  const { category } = req.params;
  const page = query.page;
  delete query.q;
  delete query.searchFilter;
  delete query.page;
  const products = await adminRepository.getAdminAllProductsByCategory(
    q,
    searchFilter,
    category,
    query,
    page
  );
  const totalLength = await adminRepository.getAdminAllProductsLengthByCategory(
    q,
    searchFilter,
    category,
    query
  );
  if (!products)
    return res.status(400).json({
      message: "get product error",
    });
  return res.status(200).json({ products, totalLength });
}

export async function addAdminProduct(req, res) {
  const { name, price, category, img, stock, description, isNew, createdAt } =
    req.body;
  await adminRepository.addAdminProduct({
    name,
    price,
    category,
    img,
    stock,
    description,
    isNew,
    createdAt,
  });
  return res.sendStatus(200);
}

export async function updateDateAdminProduct(req, res) {
  const { productId } = req.body;
  const product = await productRepository.getProductById(productId);
  if (!product)
    return res.status(400).json({
      message: "get product error",
    });
  await adminRepository.updateAdminProduct(productId, {
    createdAt: dayjs(Date.now()).format("YYYY-MM-DDTHH:mm:ss"),
  });
  return res.sendStatus(200);
}

export async function updateAdminProduct(req, res) {
  const { productId } = req.body;
  const product = await productRepository.getProductById(productId);
  if (!product)
    return res.status(400).json({
      message: "get product error",
    });
  const { name, price, category, img, stock, description, isNew } = req.body;
  await adminRepository.updateAdminProduct(productId, {
    name,
    price,
    category,
    img,
    stock,
    description,
    isNew,
  });
  return res.sendStatus(200);
}

export async function deleteAdminProduct(req, res) {
  const { id } = req.params;
  const product = await productRepository.getProductById(id);
  if (!product)
    return res.status(400).json({
      message: "get product error",
    });
  await adminRepository.deleteAdminProduct(id);
  return res.sendStatus(200);
}

//------------------------------//

export async function getAdminUser(req, res) {
  const query = req.query;
  const q = query.q;
  const page = query.page;
  const searchFilter = query.searchFilter;
  delete query.q;
  delete query.searchFilter;
  delete query.page;
  const users = await adminRepository.getAdminAllUsers(
    q,
    searchFilter,
    query,
    page
  );
  const totalLength = await adminRepository.getAdminAllUsersLength(
    q,
    searchFilter,
    query
  );
  if (!users)
    return res.status(400).json({
      message: "get user error",
    });
  return res.status(200).json({ users, totalLength });
}

export async function updateAdminUser(req, res) {
  const { userId } = req.body;
  const user = await authRepository.getUserById(userId);
  if (!user)
    return res.status(400).json({
      message: "get user error",
    });
  const { name, isAdmin, zipcode, address1, address2, phone, newPassword } =
    req.body;
  if (newPassword) {
    const saltRound = Number(process.env.SALT_ROUND);
    const hashedPw = await bcrypt.hash(newPassword, saltRound);
    await adminRepository.updateAdminUser(userId, {
      name,
      isAdmin,
      zipcode,
      address1,
      address2,
      phone,
      password: hashedPw,
    });
  } else {
    await adminRepository.updateAdminUser(userId, {
      name,
      isAdmin,
      zipcode,
      address1,
      address2,
      phone,
    });
  }
  return res.sendStatus(200);
}

export async function updateAdminAuthOrder(req, res) {
  const { orderId } = req.body;
  const order = await orderRepository.getOrderById(orderId);
  if (!order)
    return res.status(400).json({
      message: "get order error",
    });
  const user = await authRepository.getUserById(order.userId);
  if (!user)
    return res.status(400).json({
      message: "get user error",
    });
  const {
    name,
    phone,
    address1,
    address2,
    zipcode,
    orderStatus,
    trackingNumber,
  } = req.body;
  await orderRepository.updateOrderById(orderId, {
    name,
    phone,
    address1,
    address2,
    zipcode,
    orderStatus,
    trackingNumber,
  });
  const newOrders = user.orders;
  const findUpdateOrderIndex = newOrders.findIndex(
    (order) => order.orderId === orderId
  );
  newOrders[findUpdateOrderIndex].name = name;
  newOrders[findUpdateOrderIndex].phone = phone;
  newOrders[findUpdateOrderIndex].address1 = address1;
  newOrders[findUpdateOrderIndex].address2 = address2;
  newOrders[findUpdateOrderIndex].zipcode = zipcode;
  newOrders[findUpdateOrderIndex].orderStatus = orderStatus || "";
  newOrders[findUpdateOrderIndex].trackingNumber = trackingNumber || "";
  await adminRepository.updateAdminUser(user.id, { orders: newOrders });
  return res.sendStatus(200);
}

export async function deleteAdminAuth(req, res) {
  const { id } = req.params;
  const user = await authRepository.getUserById(id);
  if (!user)
    return res.status(400).json({
      message: "get user error",
    });
  await adminRepository.deleteAdminUser(id);
  return res.sendStatus(200);
}

//------------------------------//

export async function getAdminAllOrder(req, res) {
  const orders = await adminRepository.getAdminAllOrders();
  if (!orders)
    return res.status(400).json({
      message: "get order error",
    });
  return res.status(200).json(orders);
}

export async function getAdminOrder(req, res) {
  const query = req.query;
  const q = query.q;
  const searchFilter = query.searchFilter;
  const orderStatus = query.orderStatus;
  const page = query.page;
  delete query.q;
  delete query.searchFilter;
  delete query.orderStatus;
  delete query.page;
  const orders = await adminRepository.getAdminAllOrdersByFilter(
    q,
    searchFilter,
    orderStatus,
    query,
    page
  );
  const totalLength = await adminRepository.getAdminAllOrdersLengthByFilter(
    q,
    searchFilter,
    orderStatus,
    query
  );
  if (!orders)
    return res.status(400).json({
      message: "get order error",
    });
  return res.status(200).json({ orders, totalLength });
}

export async function deleteAdminOrder(req, res) {
  const { id } = req.params;
  const order = await orderRepository.getOrderById(id);
  if (!order)
    return res.status(400).json({
      message: "get user error",
    });
  const user = await authRepository.getUserById(order.userId);
  if (!user)
    return res.status(400).json({
      message: "get user error",
    });
  const newOrders = user.orders.filter((order) => order.orderId !== id);
  await adminRepository.updateAdminUser(user.id, { orders: newOrders });
  await adminRepository.deleteAdminOrder(id);
  return res.sendStatus(200);
}
