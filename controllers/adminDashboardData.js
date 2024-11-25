const Order = require("../models/order");

exports.getSalesDetails = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const startOfYesterday = new Date();
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    startOfYesterday.setHours(0, 0, 0, 0);

    const endOfYesterday = new Date();
    endOfYesterday.setDate(endOfYesterday.getDate() - 1);
    endOfYesterday.setHours(23, 59, 59, 999);

    const [todaysOrders, yesterdaysOrders] = await Promise.all([
      Order.find({ createdAt: { $gte: startOfDay, $lte: endOfDay } }),
      Order.find({
        createdAt: { $gte: startOfYesterday, $lte: endOfYesterday },
      }),
    ]);

    const todaysSales = todaysOrders.reduce(
      (acc, order) => acc + order.total,
      0
    );
    const yesterdaysSales = yesterdaysOrders.reduce(
      (acc, order) => acc + order.total,
      0
    );

    const todayPendingCount = todaysOrders.filter(
      (order) => order.status === "pending"
    ).length;
    const todayShippedCount = todaysOrders.filter(
      (order) => order.status === "shipped"
    ).length;
    const totalOrders = todaysOrders.length;

    return res.status(200).json({
      success: true,
      todayTotalSales: todaysSales,
      todayOrders: todaysOrders,
      todayPendingCount: todayPendingCount,
      yesterdayTotalSales: yesterdaysSales,
      yesterdayOrders: yesterdaysOrders,
      todayShippedCount,
      totalOrders,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getOverviewDetails = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const orders = await Order.find({
      permanentDeleted: false,
    });

    const revenue = orders.reduce((acc, order) => acc + order.total, 0);

    const latestUniqueCustomers = await Order.distinct("customer", {
      permanentDeleted: false,
      createdAt: { $gte: sevenDaysAgo },
    });

    const uniqueCustomers = await Order.distinct("customer", {
      permanentDeleted: false,
    });
    const totalDifferentCustomer = uniqueCustomers.length;
    const totalLatestDifferentCustomer = latestUniqueCustomers.length;

    return res.status(200).json({
      success: true,
      totalRevenue: revenue,
      totalUniqueCustomers: totalDifferentCustomer,
      totalLatestDifferentCustomer,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
