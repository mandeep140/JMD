import ChangeHistory from '@/Schema/HistorySchema';
import connectdb from '@/utils/connectdb';

export const logAdChange = async (actionType, adData, oldData, userInfo, req = null) => {
  try {
    const changes = [];
    let summary = '';

    if (actionType === 'CREATE') {
      summary = `Created new ad "${adData.title}" with media code ${adData.mediacode}`;
    } else if (actionType === 'DELETE') {
      summary = `Deleted ad "${adData.title}" with media code ${adData.mediacode}`;
    } else if (actionType === 'UPDATE' && oldData) {
      // Compare fields and track changes
      const fieldsToTrack = [
        'title', 'status', 'clientname', 'city', 'locality', 'type', 
        'size', 'height', 'width', 'unit', 'printing', 'mounting',
        'lighting', 'pricepermonth', 'priceperday', 'bookedfrom', 
        'bookedtill', 'show', 'message'
      ];

      fieldsToTrack.forEach(field => {
        const oldValue = oldData[field];
        const newValue = adData[field];
        
        // Simple comparison with null/undefined handling
        const oldNormalized = oldValue === undefined || oldValue === null || oldValue === '' ? null : oldValue;
        const newNormalized = newValue === undefined || newValue === null || newValue === '' ? null : newValue;
        
        if (oldNormalized !== newNormalized) {
          changes.push({
            field,
            oldValue: oldNormalized,
            newValue: newNormalized
          });
        }
      });

      // Generate summary
      if (changes.length > 0) {
        const changeDescriptions = changes.slice(0, 3).map(change => {
          if (change.field === 'pricepermonth' || change.field === 'priceperday') {
            return `${change.field} from ₹${change.oldValue || 'N/A'} to ₹${change.newValue || 'N/A'}`;
          }
          return `${change.field} from "${change.oldValue || 'N/A'}" to "${change.newValue || 'N/A'}"`;
        });
        
        const moreChanges = changes.length > 3 ? ` and ${changes.length - 3} more fields` : '';
        summary = `Updated ${changeDescriptions.join(', ')}${moreChanges} for ad "${adData.title}" (${adData.mediacode})`;
      } else {
        summary = `Updated ad "${adData.title}" (${adData.mediacode}) - No changes detected`;
      }
    }

    const historyData = {
      entityType: 'Ad',
      entityId: adData._id?.toString() || adData.mediacode,
      entityCode: adData.mediacode,
      actionType,
      changedBy: {
        userId: userInfo.id,
        userName: userInfo.name,
        userEmail: userInfo.email
      },
      changes,
      summary,
      timestamp: new Date(),
      ipAddress: req?.headers?.['x-forwarded-for'] || req?.connection?.remoteAddress || null,
      userAgent: req?.headers?.['user-agent'] || null
    };

    // Save directly here instead of separate function
    await connectdb();
    const historyRecord = new ChangeHistory(historyData);
    await historyRecord.save();
    return historyRecord;

  } catch (error) {
    console.error('Error logging ad change:', error);
    // Don't throw error to prevent breaking main functionality
    return null;
  }
};