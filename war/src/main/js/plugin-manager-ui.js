import debounce from 'lodash/debounce'
import requestAnimationFrame from 'raf';

import pluginManagerAvailable from './templates/plugin-manager/available.hbs'
import pluginManager from './api/pluginManager';

function applyFilter(searchQuery) {
    // debounce reduces number of server side calls while typing
    pluginManager.availablePluginsSearch(searchQuery.toLowerCase().trim(), 50, function (plugins) {
        var pluginsTable = document.getElementById('plugins');
        var tbody = pluginsTable.querySelector('tbody');
        var selectedPlugins = []
        var admin = pluginsTable.dataset.hasadmin === 'true';

        function clearOldResults() {
            if (!admin) {
                tbody.innerHTML = '';
            } else {
                var rows = tbody.querySelectorAll('tr');
                if (rows) {
                    selectedPlugins = []
                    rows.forEach(function (row) {
                        var input = row.querySelector('input');
                        if (input.checked === true) {
                            var pluginName = input.name.split('.')[1]
                            selectedPlugins.push(pluginName)
                        } else {
                            row.remove();
                        }
                    })
                }
            }
        }

        clearOldResults()
        var rows = pluginManagerAvailable({
            plugins: plugins.filter(plugin => selectedPlugins.indexOf(plugin.name) === -1),
            admin
        });

        tbody.insertAdjacentHTML('beforeend', rows);

        // @see JENKINS-64504 - Update the sticky buttons position after each search.
        requestAnimationFrame(() => {
            layoutUpdateCallback.call()
        })
    })
}

var handleFilter = function (e) {
    applyFilter(e.target.value)
};

var debouncedFilter = debounce(handleFilter, 150);

document.addEventListener("DOMContentLoaded", function () {
    var filterInput = document.getElementById('filter-box');

    filterInput.addEventListener('input', debouncedFilter);

    applyFilter(filterInput.value);

    setTimeout(function () {
        layoutUpdateCallback.call();
    }, 350)

});
