// api/proxy.js
export default async function handler(req, res) {
  // CORS заголовки
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 🔥 УЛУЧШЕННЫЙ DEBUG-ЭНДПОИНТ
  if (req.query.debug === 'ip') {
    // Собираем все возможные источники IP
    const possibleIps = {
      'x-forwarded-for': req.headers['x-forwarded-for'],
      'x-real-ip': req.headers['x-real-ip'],
      'x-vercel-forwarded-for': req.headers['x-vercel-forwarded-for'],
      'x-vercel-proxy-signature': req.headers['x-vercel-proxy-signature'] ? 'present' : 'missing',
      'socket.remoteAddress': req.socket.remoteAddress,
      'connection.remoteAddress': req.connection.remoteAddress
    };

    // Пытаемся сделать тестовый запрос к внешнему сервису, чтобы узнать IP, под которым мы выходим в интернет
    let externalIp = 'Не удалось определить';
    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      externalIp = ipData.ip;
    } catch (e) {
      externalIp = `Ошибка: ${e.message}`;
    }

    return res.status(200).json({
      message: '🔍 Информация для отладки IP',
      externalIp: externalIp, // IP, с которого ваш сервер виден в интернете
      possibleIps: possibleIps, // Все IP из заголовков запроса к прокси
      headers: req.headers,
      timestamp: new Date().toISOString(),
      instruction: 'Скопируйте значение "externalIp" и добавьте его в белый список API ключа на developer.clashroyale.com'
    });
  }

  // Тестовый эндпоинт для проверки работы прокси
  if (req.query.test === '1') {
    return res.status(200).json({ 
      status: 'ok', 
      message: 'Proxy is working',
      env: process.env.CLASH_API_TOKEN ? '✅ Token exists' : '❌ Token missing'
    });
  }

  const API_TOKEN = process.env.CLASH_API_TOKEN;
  if (!API_TOKEN) {
    return res.status(500).json({ error: 'API token not configured' });
  }

  try {
    const urlPath = req.url.replace('/api/', '').split('?')[0];
    const apiUrl = `https://api.clashroyale.com/v1/${urlPath}`;
    console.log('Proxying to:', apiUrl);
    
    const response = await fetch(apiUrl, {
      headers: { 'Authorization': `Bearer ${API_TOKEN}` }
    });
    
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
}
