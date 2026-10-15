import fs from 'fs';
import path from 'path';

// Intentar leer la API KEY desde el archivo .env de server
// let apiKey = process.env.GEMINI_API_KEY;
const apiKey = process.env.GEMINI_API_KEY || 'TU_API_KEY_AQUI';

if (!apiKey) {
  try {
    const envPath = path.join(process.cwd(), 'server', '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GEMINI_API_KEY=(.+)/);
    if (match) apiKey = match[1].trim();
  } catch (e) {
    // Si no encuentra el .env, usará process.env
  }
}

if (!apiKey) {
  console.error('❌ No se encontró GEMINI_API_KEY en las variables de entorno ni en server/.env');
  process.exit(1);
}

async function getModels() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();

    if (data.error) {
      console.error('❌ Error de la API:', data.error.message);
      return;
    }

    console.log('\n================================================================================');
    console.log('📌 LISTADO DETALLADO DE MODELOS DISPONIBLES EN TU CUENTA GEMINI');
    console.log('================================================================================\n');

    const generateModels = data.models.filter(m => m.supportedGenerationMethods?.includes('generateContent'));

    generateModels.forEach(model => {
      const modelId = model.name.replace('models/', '');
      
      // Evaluar estado según la presencia de etiquetas deprecadas o fechas pasadas
      const isDeprecated = model.description?.toLowerCase().includes('deprecated') || 
                           model.description?.toLowerCase().includes('discontinued') || false;
      const statusText = isDeprecated ? '🔴 Inactivo / Descatalogado' : '🟢 Activo';

      // Determinar capa de precios según tipo de modelo y prefijo
      let tierText = '🟢 Capa Gratuita Disponible (Free Tier)';
      if (modelId.includes('pro') && !modelId.includes('preview')) {
        tierText = '🟡 Gratuito con Cuota Reducida / De Pago en Alta Frecuencia';
      } else if (modelId.includes('deep-research') || modelId.includes('antigravity') || modelId.includes('customtools')) {
        tierText = '🔴 Requiere Cuenta con Facturación / Pay-as-you-go';
      } else if (modelId.includes('flash-lite') || modelId.includes('flash')) {
        tierText = '🟢 Capa Gratuita Recomendada (Alto Rendimiento & Free Tier)';
      }

      console.log(`🔹 ID / Código Modelo : ${modelId}`);
      console.log(`   Nombre            : ${model.displayName}`);
      console.log(`   Estado            : ${statusText}`);
      console.log(`   Tipo de Licencia  : ${tierText}`);
      console.log(`   Descripción       : ${model.description ? model.description.substring(0, 110) + '...' : 'Sin descripción'}`);
      console.log('--------------------------------------------------------------------------------');
    });

  } catch (err) {
    console.error('❌ Error al consultar la API de Google:', err.message);
  }
}

getModels();