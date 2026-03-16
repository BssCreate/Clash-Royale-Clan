// api/proxy.js
export default async function handler(req, res) {
  // Добавляем CORS заголовки
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Тестовый эндпоинт для проверки
  if (req.query.test === '1') {
    return res.status(200).json({ 
      status: 'ok', 
      message: 'Proxy is working',
      env: process.env.CLASH_API_TOKEN ? 'Token exists' : 'Token missing'
    });
  }

  // Проверяем наличие токена
  const API_TOKEN = process.env.CLASH_API_TOKEN;
  if (!API_TOKEN) {
    return res.status(500).json({ error: 'API token not configured' });
  }

  try {
    // Получаем путь из запроса
    const urlPath = req.url.replace('/api/', '').split('?')[0];
    const apiUrl = `https://api.clashroyale.com/v1/${urlPath}`;
    
    console.log('Proxying to:', apiUrl); // Для отладки
    
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`
      }
    });
    
    const data = await response.json();
    
    // Добавляем заголовки ответа
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
}
