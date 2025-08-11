import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectdb from '@/utils/connectdb';
import ChangeHistory from '@/Schema/HistorySchema';

export async function GET(request) {
  try {
    // Check if user is authenticated and admin
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectdb();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const actionType = searchParams.get('actionType');
    const userId = searchParams.get('userId');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const entityCode = searchParams.get('entityCode');

    // Build filter - only for ads
    const filter = { entityType: 'Ad' };
    
    if (actionType) filter.actionType = actionType;
    if (userId) filter['changedBy.userId'] = userId;
    if (entityCode) filter.entityCode = { $regex: entityCode, $options: 'i' };

    if (fromDate || toDate) {
      filter.timestamp = {};
      if (fromDate) filter.timestamp.$gte = new Date(fromDate);
      if (toDate) filter.timestamp.$lte = new Date(toDate + 'T23:59:59.999Z');
    }

    // Get total count for pagination
    const total = await ChangeHistory.countDocuments(filter);
    
    // Get history records
    const history = await ChangeHistory.find(filter)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      history,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    // Check if user is authenticated and admin
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectdb();

    // Delete all history records
    await ChangeHistory.deleteMany({});
    return NextResponse.json({ message: 'All history records deleted' });
  } catch (error) {
    console.error('Error deleting history:', error);
    return NextResponse.json({ error: 'Failed to delete history' }, { status: 500 });
  }
}

// Helper function to create history record
export async function createHistoryRecord(data) {
  try {
    await connectdb();
    const historyRecord = new ChangeHistory(data);
    await historyRecord.save();
    return historyRecord;
  } catch (error) {
    console.error('Error creating history record:', error);
    throw error;
  }
}