const express = require('express');

const cors= require('cors');

const cookieParser = require('cookie-parser');

const app= express();

const globalErrorHandler = require('./controller/errorController');
const AppError = require('./utils/appError');
const userRouter = require('./routes/userRouter');
const StreamRoutes = require('./routes/streamRoutes');
const TemplateRoutes = require('./routes/templatesRoutes');
const patientRoutes = require('./routes/patientRoutes');
const TabletRoutes = require('./routes/tabletRoutes');

const PORT = process.env.PORT || 3001;

// Middleware

app.use(cors({origin: ["http://localhost:3000"], credentials: true}));
app.use(express.json({limit: '10kb'}));
app.use(cookieParser());


// Routes
app.use('/api/v1/users', userRouter);


app.use("/api/v1/stream", StreamRoutes);

app.use('/api/v1/templates', TemplateRoutes);

app.use('/api/v1/patients', patientRoutes);

app.use('/api/v1/tablets', TabletRoutes);

app.all("/{*any}", (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});


app.use(globalErrorHandler);
module.exports = app;