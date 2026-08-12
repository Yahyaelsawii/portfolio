const projectId = new URLSearchParams(location.search).get('id') || 'gift-it';
const projectRoutes = {
  'gift-it': 'gift-it.html',
  'rit-app': 'rit-app.html',
  passwordless: 'passwordless.html',
  'vehicle-rental': 'vehicle-rental.html',
  'mood-insights': 'mood-insights.html'
};
location.replace(projectRoutes[projectId] || projectRoutes['gift-it']);
