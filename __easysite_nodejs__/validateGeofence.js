
function validateGeofence(latitude, longitude, geofenceId, geofenceData) {
  if (!geofenceData) {
    throw new Error('Geofence data is required');
  }

  const { geometry_type, center_latitude, center_longitude, radius, polygon_coordinates } = geofenceData;

  if (geometry_type === 'circle') {
    // Calculate distance from center
    const R = 6371e3; // Earth's radius in meters
    const φ1 = center_latitude * Math.PI / 180;
    const φ2 = latitude * Math.PI / 180;
    const Δφ = (latitude - center_latitude) * Math.PI / 180;
    const Δλ = (longitude - center_longitude) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // Distance in meters

    const isInside = distance <= radius;

    return {
      isInside,
      distance,
      geofenceId,
      violationType: isInside ? null : 'outside_boundary',
      timestamp: new Date().toISOString()
    };
  }

  if (geometry_type === 'polygon') {
    // Point-in-polygon algorithm (ray casting)
    let coordinates;
    try {
      coordinates = JSON.parse(polygon_coordinates);
    } catch (error) {
      throw new Error('Invalid polygon coordinates');
    }

    let inside = false;
    for (let i = 0, j = coordinates.length - 1; i < coordinates.length; j = i++) {
      if (coordinates[i][1] > latitude !== coordinates[j][1] > latitude &&
      longitude < (coordinates[j][0] - coordinates[i][0]) * (latitude - coordinates[i][1]) / (coordinates[j][1] - coordinates[i][1]) + coordinates[i][0]) {
        inside = !inside;
      }
    }

    return {
      isInside: inside,
      distance: 0, // Distance calculation for polygons is more complex
      geofenceId,
      violationType: inside ? null : 'outside_boundary',
      timestamp: new Date().toISOString()
    };
  }

  throw new Error('Unsupported geometry type');
}