 /********************
 * DATA IMPORT/EXPORT
 ********************/
const exportData = () => {
  const dataStr = JSON.stringify(DB, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  const exportFileDefaultName = 'lycee-excellence-data.json';
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
  showNotification('Données exportées avec succès', 'success');
};

// ✅✅✅ تم إصلاح دالة importData هنا ✅✅✅
const importData = function() {
  const file = this.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      // ✅ الحل: نستخدم البيانات المستوردة مباشرة بدلاً من استدعاء getData()
      const importedData = JSON.parse(e.target.result);
      if (confirm('Êtes-vous sûr de vouloir importer ces données ? Toutes les données actuelles seront remplacées.')) {
        localStorage.setItem(LS_KEY, JSON.stringify(importedData));
        // ✅ هذا هو السطر المهم: نسند البيانات المستوردة مباشرة إلى DB
        DB = importedData;
        showNotification('Données importées avec succès !', 'success');
        location.reload();
      }
    } catch (error) {
      console.error('Import error:', error);
      showNotification('Erreur lors de l\'importation du fichier. Le format est invalide.', 'error');
    }
  };
  reader.readAsText(file);
};
