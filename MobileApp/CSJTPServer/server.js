const express = require('express'),
	morgan = require('morgan'),
	mongoose = require('mongoose'),
	routes = require('./routes/routes');

const app = express();

app.use(morgan('dev'));
app.use(express.json());

const port = 1504;

app.use('/api', routes);

const dbConnection = mongoose
	.connect('mongodb://localhost:27017/CSJTP', {
		useNewUrlParser: true
	})
	.then(() => {
		app.listen(port, () => {
			console.log(`Server started @ http://localhost:${port}`);
		});
	})
	.catch((err) => {
		console.log(`Failed to connect to monogoDb ${err}`);
	});
