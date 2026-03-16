export default async function handler(req, res) {
  // Настройка CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Обработка preflight запросов
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Токен API (лучше хранить в переменных окружения)
  const API_TOKEN = process.env.CLASH_API_TOKEN || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6ImNlOTQ0NTc3LTVmZjktNDJmYS05NWYzLTUwMjY5YTY3MjFmZCIsImlhdCI6MTc3MzY2ODAxNywic3ViIjoiZGV2ZWxvcGVyL2M3MzE3ODY4LWExODEtNzZmNi00YWJkLTZkN2VkYzI5MmMxOCIsInNjb3BlcyI6WyJyb3lhbGUiXSwibGltaXRzIjpbeyJ0aWVyIjoiZGV2ZWxvcGVyL3NpbHZlciIsInR5cGUiOiJ0aHJvdHRsaW5nIn0seyJjaWRycyI6WyIxMDQuMTY4LjEwLjE1MiJdLCJ0eXBlIjoiY2xpZW50In1dfQ.2Vrl5BaD-bXlQWXz48rOCPFkW4_s77qNqPFr_7RhIFN8YUTxRt7jE-JX8pRD6qgKH524yKDGOsiRS4opN824hA';
  
  // Получаем путь из запроса (например, /clans/%23G89JVCUL)
  const path = req.url.replace('/api/', '');
  
  try {
    const response = await fetch(`https://api.clashroyale.com/v1/${path}`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`
      }
    });
    
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Proxy error: ' + error.message });
  }
}
