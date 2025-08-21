 // Variables globales
        let personnel = JSON.parse(localStorage.getItem('personnel') || '[]');
        let brigades = JSON.parse(localStorage.getItem('brigades') || '[]');
        let inventories = JSON.parse(localStorage.getItem('inventories') || '{}');

        // Inicialización
        document.addEventListener('DOMContentLoaded', function() {
            updatePersonnelList();
            updateBrigadesList();
            updateSelects();
            updateInventoryBrigadeSelect();
        });

        // Funciones de navegación
        function showTab(tabName) {
            // Ocultar todas las secciones
            document.querySelectorAll('.form-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Remover clase active de todos los tabs
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Mostrar sección seleccionada
            document.getElementById(tabName).classList.add('active');
            
            // Marcar tab como activo
            event.target.classList.add('active');
        }

        // Funciones de Personal
        function addPersonnel() {
            const name = document.getElementById('personnelName').value;
            const phone = document.getElementById('personnelPhone').value;
            const role = document.getElementById('personnelRole').value;
            const specialty = document.getElementById('personnelSpecialty').value;

            if (!name || !phone) {
                alert('Por favor complete los campos obligatorios (Nombre y Teléfono)');
                return;
            }

            const newPerson = {
                id: Date.now(),
                name,
                phone,
                role,
                specialty
            };

            personnel.push(newPerson);
            localStorage.setItem('personnel', JSON.stringify(personnel));
            
            // Limpiar formulario
            document.getElementById('personnelName').value = '';
            document.getElementById('personnelPhone').value = '';
            document.getElementById('personnelSpecialty').value = '';
            
            updatePersonnelList();
            updateSelects();
            showAlert('Personal agregado exitosamente', 'success');
        }

        function deletePersonnel(id) {
            if (confirm('¿Está seguro de eliminar este personal?')) {
                personnel = personnel.filter(p => p.id !== id);
                localStorage.setItem('personnel', JSON.stringify(personnel));
                updatePersonnelList();
                updateSelects();
                showAlert('Personal eliminado exitosamente', 'success');
            }
        }

        function updatePersonnelList() {
            const list = document.getElementById('personnelList');
            if (personnel.length === 0) {
                list.innerHTML = '<p>No hay personal registrado</p>';
                return;
            }

            list.innerHTML = personnel.map(person => `
                <div class="list-item">
                    <div class="list-item-content">
                        <strong>${person.name}</strong><br>
                        <small>📞 ${person.phone} | 👤 ${person.role}</small>
                        ${person.specialty ? `<br><small>🎯 ${person.specialty}</small>` : ''}
                    </div>
                    <div class="list-item-actions">
                        <button class="btn btn-danger btn-sm" onclick="deletePersonnel(${person.id})">🗑️</button>
                    </div>
                </div>
            `).join('');
        }

        // Funciones de Brigadas
        function addBrigade() {
            const name = document.getElementById('brigadeName').value;
            const activeFirefighters = document.getElementById('activeFirefighters').value;
            const commanderId = document.getElementById('commander').value;
            const logisticsManagerId = document.getElementById('logisticsManager').value;
            const emergencyNumber = document.getElementById('emergencyNumber').value;

            if (!name || !activeFirefighters || !commanderId) {
                alert('Por favor complete los campos obligatorios');
                return;
            }

            const commander = personnel.find(p => p.id == commanderId);
            const logisticsManager = personnel.find(p => p.id == logisticsManagerId);

            const newBrigade = {
                id: Date.now(),
                name,
                activeFirefighters,
                commander,
                logisticsManager,
                emergencyNumber
            };

            brigades.push(newBrigade);
            localStorage.setItem('brigades', JSON.stringify(brigades));
            
            // Limpiar formulario
            document.getElementById('brigadeName').value = '';
            document.getElementById('activeFirefighters').value = '';
            document.getElementById('commander').value = '';
            document.getElementById('logisticsManager').value = '';
            document.getElementById('emergencyNumber').value = '';
            
            updateBrigadesList();
            updateInventoryBrigadeSelect();
            showAlert('Brigada creada exitosamente', 'success');
        }

        function deleteBrigade(id) {
            if (confirm('¿Está seguro de eliminar esta brigada?')) {
                brigades = brigades.filter(b => b.id !== id);
                localStorage.setItem('brigades', JSON.stringify(brigades));
                updateBrigadesList();
                updateInventoryBrigadeSelect();
                showAlert('Brigada eliminada exitosamente', 'success');
            }
        }

        function updateBrigadesList() {
            const list = document.getElementById('brigadesList');
            if (brigades.length === 0) {
                list.innerHTML = '<p>No hay brigadas registradas</p>';
                return;
            }

            list.innerHTML = brigades.map(brigade => `
                <div class="list-item">
                    <div class="list-item-content">
                        <strong>🚒 ${brigade.name}</strong><br>
                        <small>👥 ${brigade.activeFirefighters} bomberos activos</small><br>
                        <small>👨‍💼 Comandante: ${brigade.commander.name}</small>
                        ${brigade.logisticsManager ? `<br><small>📦 Logística: ${brigade.logisticsManager.name}</small>` : ''}
                        ${brigade.emergencyNumber ? `<br><small>🚨 Emergencia: ${brigade.emergencyNumber}</small>` : ''}
                    </div>
                    <div class="list-item-actions">
                        <button class="btn btn-danger btn-sm" onclick="deleteBrigade(${brigade.id})">🗑️</button>
                    </div>
                </div>
            `).join('');
        }

        function updateSelects() {
            const commanderSelect = document.getElementById('commander');
            const logisticsSelect = document.getElementById('logisticsManager');
            
            const options = personnel.map(person => 
                `<option value="${person.id}">${person.name} (${person.role})</option>`
            ).join('');

            commanderSelect.innerHTML = '<option value="">Seleccionar Comandante</option>' + options;
            logisticsSelect.innerHTML = '<option value="">Seleccionar Encargado</option>' + options;
        }

        function updateInventoryBrigadeSelect() {
            const select = document.getElementById('inventoryBrigade');
            const options = brigades.map(brigade => 
                `<option value="${brigade.id}">${brigade.name}</option>`
            ).join('');

            select.innerHTML = '<option value="">Seleccionar Brigada</option>' + options;
        }

        // Funciones de Inventario
        function loadBrigadeData() {
            const brigadeId = document.getElementById('inventoryBrigade').value;
            const info = document.getElementById('brigadeInfo');
            
            if (!brigadeId) {
                info.classList.add('hidden');
                return;
            }

            const brigade = brigades.find(b => b.id == brigadeId);
            if (brigade) {
                info.classList.remove('hidden');
                info.innerHTML = `
                    <strong>Brigada: ${brigade.name}</strong><br>
                    Bomberos Activos: ${brigade.activeFirefighters}<br>
                    Comandante: ${brigade.commander.name} (${brigade.commander.phone})<br>
                    ${brigade.logisticsManager ? `Logística: ${brigade.logisticsManager.name} (${brigade.logisticsManager.phone})<br>` : ''}
                    ${brigade.emergencyNumber ? `Emergencia: ${brigade.emergencyNumber}` : ''}
                `;
            }
        }

        function quickFillSizes(item, quantity) {
            const sizes = ['XS', 'S', 'M', 'L', 'XL'];
            sizes.forEach(size => {
                const element = document.getElementById(item + size);
                if (element) {
                    element.value = quantity;
                }
            });
            updateProgress();
        }

        function clearAllSizes() {
            const inputs = document.querySelectorAll('input[type="number"]');
            inputs.forEach(input => {
                input.value = 0;
            });
            updateProgress();
        }

        function updateProgress() {
            const inputs = document.querySelectorAll('input[type="number"]');
            let filled = 0;
            let total = 0;
            
            inputs.forEach(input => {
                total++;
                if (input.value > 0) {
                    filled++;
                }
            });
            
            const percentage = total > 0 ? (filled / total) * 100 : 0;
            document.querySelector('.progress-fill').style.width = percentage + '%';
        }

        function saveInventory() {
            const brigadeId = document.getElementById('inventoryBrigade').value;
            
            if (!brigadeId) {
                alert('Por favor seleccione una brigada');
                return;
            }

            // Recopilar datos del formulario
            const inventoryData = {
                brigadeId: brigadeId,
                timestamp: new Date().toISOString(),
                epp: {
                    camisa: {
                        xs: document.getElementById('camisaXS').value || 0,
                        s: document.getElementById('camisaS').value || 0,
                        m: document.getElementById('camisaM').value || 0,
                        l: document.getElementById('camisaL').value || 0,
                        xl: document.getElementById('camisaXL').value || 0,
                        observaciones: document.getElementById('camisaObs').value || ''
                    },
                    pantalon: {
                        xs: document.getElementById('pantalonXS').value || 0,
                        s: document.getElementById('pantalonS').value || 0,
                        m: document.getElementById('pantalonM').value || 0,
                        l: document.getElementById('pantalonL').value || 0,
                        xl: document.getElementById('pantalonXL').value || 0,
                        observaciones: document.getElementById('pantalonObs').value || ''
                    },
                    overall: {
                        xs: document.getElementById('overallXS').value || 0,
                        s: document.getElementById('overallS').value || 0,
                        m: document.getElementById('overallM').value || 0,
                        l: document.getElementById('overallL').value || 0,
                        xl: document.getElementById('overallXL').value || 0,
                        observaciones: document.getElementById('overallObs').value || ''
                    }
                },
                botas: {
                    t37: document.getElementById('botas37').value || 0,
                    t38: document.getElementById('botas38').value || 0,
                    t39: document.getElementById('botas39').value || 0,
                    t40: document.getElementById('botas40').value || 0,
                    t41: document.getElementById('botas41').value || 0,
                    t42: document.getElementById('botas42').value || 0,
                    t43: document.getElementById('botas43').value || 0
                }
            };

            inventories[brigadeId] = inventoryData;
            localStorage.setItem('inventories', JSON.stringify(inventories));
            
            showAlert('Inventario guardado exitosamente', 'success');
            
            // Animar la barra de progreso al 100%
            document.querySelector('.progress-fill').style.width = '100%';
            setTimeout(() => {
                document.querySelector('.progress-fill').style.width = '0%';
            }, 2000);
        }

        function exportData() {
            const brigadeId = document.getElementById('inventoryBrigade').value;
            
            if (!brigadeId) {
                alert('Por favor seleccione una brigada para exportar');
                return;
            }

            const brigade = brigades.find(b => b.id == brigadeId);
            const inventory = inventories[brigadeId];
            
            if (!inventory) {
                alert('No hay datos de inventario para esta brigada');
                return;
            }

            const exportData = {
                brigada: brigade,
                inventario: inventory,
                fecha_exportacion: new Date().toLocaleString('es-BO')
            };

            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `inventario_${brigade.name}_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            URL.revokeObjectURL(url);
            showAlert('Datos exportados exitosamente', 'success');
        }

        function showAlert(message, type) {
            // Remover alertas existentes
            const existingAlerts = document.querySelectorAll('.alert');
            existingAlerts.forEach(alert => alert.remove());

            const alert = document.createElement('div');
            alert.className = `alert alert-${type}`;
            alert.innerHTML = message;
            
            const content = document.querySelector('.content');
            content.insertBefore(alert, content.firstChild);
            
            // Auto-remover después de 3 segundos
            setTimeout(() => {
                alert.remove();
            }, 3000);
        }

        // Event listeners para actualizar progreso
        document.addEventListener('input', function(e) {
            if (e.target.type === 'number') {
                updateProgress();
            }
        });

        // Funciones adicionales para mejorar UX
        function resetForm() {
            const form = document.querySelector('#inventory');
            const inputs = form.querySelectorAll('input[type="number"], input[type="text"], textarea');
            inputs.forEach(input => {
                if (input.type === 'number') {
                    input.value = 0;
                } else {
                    input.value = '';
                }
            });
            updateProgress();
        }

        function loadInventoryData(brigadeId) {
            const inventory = inventories[brigadeId];
            if (inventory) {
                // Cargar datos EPP - Camisa
                document.getElementById('camisaXS').value = inventory.epp.camisa.xs || 0;
                document.getElementById('camisaS').value = inventory.epp.camisa.s || 0;
                document.getElementById('camisaM').value = inventory.epp.camisa.m || 0;
                document.getElementById('camisaL').value = inventory.epp.camisa.l || 0;
                document.getElementById('camisaXL').value = inventory.epp.camisa.xl || 0;
                document.getElementById('camisaObs').value = inventory.epp.camisa.observaciones || '';

                // Cargar datos EPP - Pantalón
                document.getElementById('pantalonXS').value = inventory.epp.pantalon.xs || 0;
                document.getElementById('pantalonS').value = inventory.epp.pantalon.s || 0;
                document.getElementById('pantalonM').value = inventory.epp.pantalon.m || 0;
                document.getElementById('pantalonL').value = inventory.epp.pantalon.l || 0;
                document.getElementById('pantalonXL').value = inventory.epp.pantalon.xl || 0;
                document.getElementById('pantalonObs').value = inventory.epp.pantalon.observaciones || '';

                // Cargar datos EPP - Overall
                document.getElementById('overallXS').value = inventory.epp.overall.xs || 0;
                document.getElementById('overallS').value = inventory.epp.overall.s || 0;
                document.getElementById('overallM').value = inventory.epp.overall.m || 0;
                document.getElementById('overallL').value = inventory.epp.overall.l || 0;
                document.getElementById('overallXL').value = inventory.epp.overall.xl || 0;
                document.getElementById('overallObs').value = inventory.epp.overall.observaciones || '';

                // Cargar datos Botas
                document.getElementById('botas37').value = inventory.botas.t37 || 0;
                document.getElementById('botas38').value = inventory.botas.t38 || 0;
                document.getElementById('botas39').value = inventory.botas.t39 || 0;
                document.getElementById('botas40').value = inventory.botas.t40 || 0;
                document.getElementById('botas41').value = inventory.botas.t41 || 0;
                document.getElementById('botas42').value = inventory.botas.t42 || 0;
                document.getElementById('botas43').value = inventory.botas.t43 || 0;

                updateProgress();
                showAlert('Datos de inventario cargados', 'success');
            }
        }

        // Modificar la función loadBrigadeData para cargar también el inventario
        function loadBrigadeData() {
            const brigadeId = document.getElementById('inventoryBrigade').value;
            const info = document.getElementById('brigadeInfo');
            
            if (!brigadeId) {
                info.classList.add('hidden');
                resetForm();
                return;
            }

            const brigade = brigades.find(b => b.id == brigadeId);
            if (brigade) {
                info.classList.remove('hidden');
                info.innerHTML = `
                    <strong>🚒 Brigada: ${brigade.name}</strong><br>
                    👥 Bomberos Activos: ${brigade.activeFirefighters}<br>
                    👨‍💼 Comandante: ${brigade.commander.name} (📞 ${brigade.commander.phone})<br>
                    ${brigade.logisticsManager ? `📦 Logística: ${brigade.logisticsManager.name} (📞 ${brigade.logisticsManager.phone})<br>` : ''}
                    ${brigade.emergencyNumber ? `🚨 Emergencia: ${brigade.emergencyNumber}` : ''}
                `;
                
                // Cargar datos de inventario si existen
                loadInventoryData(brigadeId);
            }
        }

        // Función para validación rápida
        function validateForm() {
            const brigadeId = document.getElementById('inventoryBrigade').value;
            if (!brigadeId) {
                showAlert('Por favor seleccione una brigada', 'danger');
                return false;
            }
            return true;
        }

        // Agregar tooltips y ayuda contextual
        function showTooltip(element, message) {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.innerHTML = message;
            tooltip.style.cssText = `
                position: absolute;
                background: #333;
                color: white;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 12px;
                z-index: 1000;
                pointer-events: none;
                opacity: 0.9;
            `;
            
            document.body.appendChild(tooltip);
            
            const rect = element.getBoundingClientRect();
            tooltip.style.left = rect.left + 'px';
            tooltip.style.top = (rect.top - tooltip.offsetHeight - 5) + 'px';
            
            setTimeout(() => {
                tooltip.remove();
            }, 3000);
        }

        // Auto-guardar cada 30 segundos
        let autoSaveTimer;
        function startAutoSave() {
            clearInterval(autoSaveTimer);
            autoSaveTimer = setInterval(() => {
                const brigadeId = document.getElementById('inventoryBrigade').value;
                if (brigadeId && validateForm()) {
                    saveInventory();
                    console.log('Auto-guardado realizado');
                }
            }, 30000);
        }

        // Iniciar auto-guardado cuando se selecciona una brigada
        document.getElementById('inventoryBrigade').addEventListener('change', function() {
            if (this.value) {
                startAutoSave();
            } else {
                clearInterval(autoSaveTimer);
            }
        });

        // Función para importar datos
        function importData() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        try {
                            const data = JSON.parse(e.target.result);
                            
                            // Validar estructura de datos
                            if (data.brigada && data.inventario) {
                                // Importar brigada si no existe
                                const existingBrigade = brigades.find(b => b.name === data.brigada.name);
                                if (!existingBrigade) {
                                    brigades.push(data.brigada);
                                    localStorage.setItem('brigades', JSON.stringify(brigades));
                                    updateBrigadesList();
                                    updateInventoryBrigadeSelect();
                                }
                                
                                // Importar inventario
                                inventories[data.brigada.id] = data.inventario;
                                localStorage.setItem('inventories', JSON.stringify(inventories));
                                
                                showAlert('Datos importados exitosamente', 'success');
                            } else {
                                showAlert('Formato de archivo inválido', 'danger');
                            }
                        } catch (error) {
                            showAlert('Error al leer el archivo', 'danger');
                        }
                    };
                    reader.readAsText(file);
                }
            };
            input.click();
        }

        console.log('Sistema de Brigadas de Bomberos inicializado correctamente');