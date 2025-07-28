// api/ApiClient.js
const sendRecordingToApi = async (audioPath) => {
    const data = new FormData();
    data.append('audio', {
      uri: audioPath,
      type: 'audio/aac', // Adjust based on actual audio format
      name: 'recording.aac',
    });
  
    try {
      const response = await fetch('YOUR_API_ENDPOINT', {
        method: 'POST',
        body: data,
      });
      const jsonResponse = await response.json();
      return jsonResponse;
    } catch (error) {
      console.error('Error sending recording to API:', error);
      return null;
    }
  };
  
  export { sendRecordingToApi };
  