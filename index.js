const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// get canciones
app.get('/canciones', (req, res) => {
  fs.readFile(path.join(__dirname, 'repertorio.json'), 'utf-8', (err, data) => {
    if (err) {
      return res.status(500).send('Error al leer el repertorio');
    }
    const repertorio = JSON.parse(data);
    res.json(repertorio.canciones);
  });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });

//post nueva cancion

app.post('/canciones', (req, res) => {
  const nuevaCancion = req.body;

  if (!nuevaCancion.titulo || !nuevaCancion.artista || !nuevaCancion.tono) {
    return res.status(400).send('Faltan datos para agregar la canción');
  }

  fs.readFile(path.join(__dirname, 'repertorio.json'), 'utf-8', (err, data) => {
    if (err) {
      return res.status(500).send('Error al leer el repertorio');
    }

    const repertorio = JSON.parse(data);
    nuevaCancion.id = repertorio.canciones.length + 1;
    repertorio.canciones.push(nuevaCancion);

    fs.writeFile(path.join(__dirname, 'repertorio.json'), JSON.stringify(repertorio, null, 2), (err) => {
      if (err) {
        return res.status(500).send('Error al agregar la canción');
      }
      res.status(201).send('Canción agregada');
    });
  });
});

// put para actualizar una canción
app.put('/canciones/:id', (req, res) => {
  const { id } = req.params;
  const actualizacion = req.body;

  if (!actualizacion.titulo || !actualizacion.artista || !actualizacion.tono) {
    return res.status(400).send('Faltan datos para actualizar la canción');
  }

  fs.readFile(path.join(__dirname, 'repertorio.json'), 'utf-8', (err, data) => {
    if (err) {
      return res.status(500).send('Error al leer el repertorio');
    }

    const repertorio = JSON.parse(data);
    const cancionIndex = repertorio.canciones.findIndex(c => c.id == id);

    if (cancionIndex === -1) {
      return res.status(404).send('Canción no encontrada');
    }

    repertorio.canciones[cancionIndex] = { id: parseInt(id), ...actualizacion };

    fs.writeFile(path.join(__dirname, 'repertorio.json'), JSON.stringify(repertorio, null, 2), (err) => {
      if (err) {
        return res.status(500).send('Error al actualizar la canción');
      }
      res.send('Canción actualizada');
    });
  });
});

// delete Eliminar Cancion

app.delete('/canciones', (req, res) => {
  const { id } = req.query; 

  if (!id) {
    return res.status(400).send('Falta el id de la canción');
  }

  fs.readFile(path.join(__dirname, 'repertorio.json'), 'utf-8', (err, data) => {
    if (err) {
      return res.status(500).send('Error al leer el repertorio');
    }

    const repertorio = JSON.parse(data);
    const cancionIndex = repertorio.canciones.findIndex(c => c.id == id);

    if (cancionIndex === -1) {
      return res.status(404).send('Canción no encontrada');
    }

    repertorio.canciones.splice(cancionIndex, 1);

    fs.writeFile(path.join(__dirname, 'repertorio.json'), JSON.stringify(repertorio, null, 2), (err) => {
      if (err) {
        return res.status(500).send('Error al eliminar la canción');
      }
      res.send('Canción eliminada');
    });
  });
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
