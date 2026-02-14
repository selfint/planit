// Example implementation of HSL color generation instead of RGB
function generateColor(courseId) {
    const hue = (courseId * 137.508) % 360;  // 137.508 is a golden angle in degrees
    return `hsl(${hue}, 70%, 50%)`;
}

// Use generateColor function where dynamic colors are needed
const courseColor = generateColor(course.id);
// Apply courseColor to your component accordingly