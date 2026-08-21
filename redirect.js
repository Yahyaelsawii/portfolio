const projectId = new URLSearchParams(location.search).get('id') || 'gift-it';
const projectRoutes = {
  'gift-it': '/work/gift-it',
  'rit-app': '/work/rit-app',
  passwordless: '/work/passwordless',
  'vehicle-rental': '/work/vehicle-rental',
  'mood-insights': '/work/mood-insights',
  'vr-neuroanatomy': '/work/vr-neuroanatomy',
  'network-automation': '/work/network-automation'
};
location.replace(projectRoutes[projectId] || projectRoutes['gift-it']);
