const Shipment = require("../models/Shipment");
const Bill = require("../models/Billing");
const moment = require("moment");

const getMonthlyShipmentsAndRevenue = async (req, res) => {
  try {
    const twelveMonthsAgo = moment()
      .subtract(12, "months")
      .startOf("month")
      .toDate();

    // Parallel queries for shipments and revenue
    const [shipments, billing] = await Promise.all([
      Shipment.aggregate([
        {
          $match: {
            departureDate: { $gte: twelveMonthsAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$departureDate" },
              month: { $month: "$departureDate" },
            },
            totalShipments: { $sum: 1 },
            totalWeight: { $sum: "$cargoWeight" },
            shipments: {
              $push: {
                shipmentId: "$shipmentId",
                shipmentName: "$shipmentName",
                status: "$status",
                cargoWeight: "$cargoWeight",
                departureDate: "$departureDate",
                arrivalDate: "$arrivalDate",
              },
            },
          },
        },
        {
          $addFields: {
            month: {
              $dateFromParts: {
                year: "$_id.year",
                month: "$_id.month",
              },
            },
          },
        },
        { $sort: { month: 1 } },
      ]),
      Bill.aggregate([
        {
          $match: {
            issueDate: { $gte: twelveMonthsAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$issueDate" },
              month: { $month: "$issueDate" },
            },
            totalRevenue: { $sum: "$totalAmount" },
            billCount: { $sum: 1 },
            bills: {
              $push: {
                billId: "$billId",
                totalAmount: "$totalAmount",
                paymentStatus: "$paymentStatus",
              },
            },
          },
        },
        {
          $addFields: {
            month: {
              $dateFromParts: {
                year: "$_id.year",
                month: "$_id.month",
              },
            },
          },
        },
        { $sort: { month: 1 } },
      ]),
    ]);

    // Process the data to ensure all months are represented
    const monthlyData = [];
    const current = moment(twelveMonthsAgo);
    const end = moment();

    while (current.isSameOrBefore(end, "month")) {
      const yearMonth = {
        year: current.year(),
        month: current.month() + 1,
      };

      const shipmentData = shipments.find(
        (s) => s._id.year === yearMonth.year && s._id.month === yearMonth.month,
      ) || {
        totalShipments: 0,
        totalWeight: 0,
        shipments: [],
      };

      const billingData = billing.find(
        (b) => b._id.year === yearMonth.year && b._id.month === yearMonth.month,
      ) || {
        totalRevenue: 0,
        billCount: 0,
        bills: [],
      };

      // Calculate status counts for the month
      const statusCounts = shipmentData.shipments.reduce((acc, shipment) => {
        acc[shipment.status] = (acc[shipment.status] || 0) + 1;
        return acc;
      }, {});

      monthlyData.push({
        year: yearMonth.year,
        month: yearMonth.month,
        monthName: current.format("MMMM"),
        shipments: {
          count: shipmentData.totalShipments,
          totalWeight: shipmentData.totalWeight,
          statusBreakdown: {
            pending: statusCounts.pending || 0,
            delivered: statusCounts.delivered || 0,
            cancelled: statusCounts.cancelled || 0,
          },
          details: shipmentData.shipments.map((s) => ({
            id: s.shipmentId,
            name: s.shipmentName,
            status: s.status,
            weight: s.cargoWeight,
            departure: s.departureDate,
            arrival: s.arrivalDate,
          })),
        },
        billing: {
          totalRevenue: billingData.totalRevenue,
          count: billingData.billCount,
          details: billingData.bills.map((b) => ({
            id: b.billId,
            amount: b.totalAmount,
            status: b.paymentStatus,
          })),
        },
      });

      current.add(1, "month");
    }

    // Calculate average monthly revenue and total metrics
    const totalRevenue = monthlyData.reduce(
      (sum, month) => sum + month.billing.totalRevenue,
      0,
    );
    const totalShipments = monthlyData.reduce(
      (sum, month) => sum + month.shipments.count,
      0,
    );
    const averageMonthlyRevenue = totalRevenue / monthlyData.length;
    const averageMonthlyShipments = totalShipments / monthlyData.length;

    res.status(200).json({
      success: true,
      data: monthlyData,
      metadata: {
        periodStart: twelveMonthsAgo,
        periodEnd: new Date(),
        totalMonths: monthlyData.length,
        totals: {
          revenue: totalRevenue,
          shipments: totalShipments,
        },
        averages: {
          monthlyRevenue: averageMonthlyRevenue,
          monthlyShipments: averageMonthlyShipments,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  getMonthlyShipmentsAndRevenue,
};
