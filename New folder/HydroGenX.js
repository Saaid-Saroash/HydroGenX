const elements = {
    status: document.getElementById('status'),
    onOffSwitch: document.getElementById('onOffSwitch'),
    loading: document.getElementById('loading'),
    onPassword: document.getElementById('onPassword'),
    onInput: document.getElementById('onInput'),
    onConfirm: document.getElementById('onConfirm'),
    temperature: document.getElementById('temperature'),
    battery: document.getElementById('battery'),
    voltage: document.getElementById('voltage'),
    efficiency: document.getElementById('efficiency'),
    shutdownPassword: document.getElementById('shutdownPassword'),
    shutdownInput: document.getElementById('shutdownInput'),
    shutdownLoading: document.getElementById('shutdownLoading'),
    killPassword: document.getElementById('killPassword'),
    killInput: document.getElementById('killInput'),
    centerMessage: document.getElementById('centerMessage'),
    cmdOutput: document.getElementById('cmdOutput')
};

let isOn = false;
let requiresPassword = false;
let isKilled = false;

// Utility functions for visibility and text update
function toggleVisibility(element, show) {
    element.classList.toggle('hidden', !show);
}

function updateElementText(element, text) {
    element.textContent = text;
}

function randomTimeout(min, max) {
    return Math.random() * (max - min) + min;
}

function toggleLoadingBar(loadingBar, callback) {
    const bar = loadingBar.querySelector('div');
    let width = 0;
    bar.style.width = width;
    toggleVisibility(loadingBar, true);
    const interval = setInterval(() => {
        width += 10;
        bar.style.width = width + '%';
        if (width >= 100) {
            clearInterval(interval);
            toggleVisibility(loadingBar, false);
            callback();
        }
    }, randomTimeout(300, 1000));
}

function logCmdOutput(message) {
    elements.cmdOutput.textContent += '\n' + message;
    elements.cmdOutput.scrollTop = elements.cmdOutput.scrollHeight;
}

// Temperature function (starts between 27°C and 39°C, increases to 79°C)
function updateTemperature() {
    let temp = Math.floor(Math.random() * (39 - 27 + 1)) + 27; // Start between 27 and 39
    updateElementText(elements.temperature, `Temperature: ${temp}°C`);

    setInterval(() => {
        if (temp < 79) {
            temp += Math.floor(Math.random() * 5) + 1;  // Random increase
            updateElementText(elements.temperature, `Temperature: ${temp}°C`);
        }
    }, randomTimeout(3000, 6000));
}

// Battery function (starts at 97%, drops every 3 to 6 seconds until it reaches 85%, then rises back to 100%)
function updateBattery() {
    let battery = 97; // Start from 97%
    updateElementText(elements.battery, `Battery: ${battery}%`);

    let isIncreasing = false;  // Track if the battery is increasing after reaching 85%

    setInterval(() => {
        if (battery <= 85 && !isIncreasing) {
            battery -= Math.floor(Math.random() * 3) + 1;  // Random drop below 85%
            updateElementText(elements.battery, `Battery: ${battery}%`);
        } else if (battery < 100 && isIncreasing) {
            battery += Math.floor(Math.random() * 3) + 1;  // Random increase above 85%
            updateElementText(elements.battery, `Battery: ${battery}%`);
        }

        // Switch to increase after dropping below 85%
        if (battery <= 85 && !isIncreasing) {
            isIncreasing = true;
        }
    }, randomTimeout(3000, 6000));
}

// Voltage function (starts at 0.02V, increases to a maximum of 12-15V)
function updateVoltage() {
    let voltage = 0.02; // Start from 0.02V
    updateElementText(elements.voltage, `Voltage: ${voltage.toFixed(2)}V`);

    setInterval(() => {
        if (voltage < 15) {
            voltage += Math.random() * (0.2 - 0.05) + 0.05;  // Random increase
            updateElementText(elements.voltage, `Voltage: ${voltage.toFixed(2)}V`);
        }
    }, randomTimeout(3000, 6000));
}

// Efficiency function (starts between -15% to -7%, increases as battery increases)
function updateEfficiency() {
    let efficiency = Math.floor(Math.random() * (9 + 1)) - 15; // Start from a random -15 to -7
    updateElementText(elements.efficiency, `Efficiency Rate: ${efficiency}%`);

    setInterval(() => {
        let battery = parseInt(elements.battery.textContent.split(': ')[1]);
        if (battery > 85 && efficiency < 92) {
            efficiency += Math.floor(Math.random() * 2) + 1;  // Increase by 1-2% each second when battery > 85%
            updateElementText(elements.efficiency, `Efficiency Rate: ${efficiency}%`);
        }
    }, 1000);
}

// Start all controls
function startControls() {
    updateTemperature();
    updateBattery();
    updateVoltage();
    updateEfficiency();
}

elements.onOffSwitch.addEventListener('click', () => {
    if (isKilled) {
        showMessage("Device Not Found");
        return;
    }

    if (requiresPassword) {
        toggleVisibility(elements.onPassword, true);
        elements.onInput.focus();
        return;
    }

    if (!isOn) {
        toggleLoadingBar(elements.loading, () => {
            updateElementText(elements.status, 'Active');
            elements.onOffSwitch.textContent = 'Power Down';
            isOn = true;
            toggleVisibility(document.getElementById('temperatureControl'), true);
            toggleVisibility(document.getElementById('batteryControl'), true);
            toggleVisibility(document.getElementById('voltageControl'), true);
            toggleVisibility(document.getElementById('efficiencyControl'), true);
            startControls();
            logCmdOutput('Powered up successfully');
        });
    } else {
        toggleLoadingBar(elements.loading, () => {
            updateElementText(elements.status, 'Device Offline');
            elements.onOffSwitch.textContent = 'Power Up';
            isOn = false;
            toggleVisibility(document.getElementById('temperatureControl'), false);
            toggleVisibility(document.getElementById('batteryControl'), false);
            toggleVisibility(document.getElementById('voltageControl'), false);
            toggleVisibility(document.getElementById('efficiencyControl'), false);
            logCmdOutput('Powered down');
        });
    }
});

elements.onConfirm.addEventListener('click', () => {
    if (elements.onInput.value === '5896') {
        toggleLoadingBar(elements.loading, () => {
            updateElementText(elements.status, 'Active');
            elements.onOffSwitch.textContent = 'Power Down';
            isOn = true;
            toggleVisibility(elements.onPassword, false);
            toggleVisibility(document.getElementById('temperatureControl'), true);
            toggleVisibility(document.getElementById('batteryControl'), true);
            toggleVisibility(document.getElementById('voltageControl'), true);
            toggleVisibility(document.getElementById('efficiencyControl'), true);
            startControls();
            logCmdOutput('Powered up successfully');
        });
    } else {
        showMessage('Incorrect password!');
    }
});

document.getElementById('emergencyShutdown').addEventListener('click', () => toggleVisibility(elements.shutdownPassword, true));
document.getElementById('shutdownConfirm').addEventListener('click', () => {
    if (elements.shutdownInput.value === '5896') {
        toggleLoadingBar(elements.shutdownLoading, () => {
            updateElementText(elements.status, 'Device Offline');
            toggleVisibility(document.getElementById('temperatureControl'), false);
            toggleVisibility(document.getElementById('batteryControl'), false);
            toggleVisibility(document.getElementById('voltageControl'), false);
            toggleVisibility(document.getElementById('efficiencyControl'), false);
            alert('Successfully Shutdown');
            toggleVisibility(elements.shutdownPassword, false);
            requiresPassword = true;
            elements.onOffSwitch.textContent = 'Power Up';
            logCmdOutput('Emergency shutdown executed');
        });
    }
});

document.getElementById('killSwitch').addEventListener('click', () => toggleVisibility(elements.killPassword, true));
document.getElementById('killConfirm').addEventListener('click', () => {
    if (elements.killInput.value === '5896') {
        toggleLoadingBar(elements.shutdownLoading, () => {
            isKilled = true;
            showMessage("Device Killed");
            elements.status.textContent = 'Device Offline';
            elements.onOffSwitch.textContent = 'Power Up';
            toggleVisibility(document.getElementById('temperatureControl'), false);
            toggleVisibility(document.getElementById('batteryControl'), false);
            toggleVisibility(document.getElementById('voltageControl'), false);
            toggleVisibility(document.getElementById('efficiencyControl'), false);
            toggleVisibility(elements.killPassword, false);
            requiresPassword = true;
            logCmdOutput('Kill switch activated');
        });
    } else {
        showMessage('Incorrect Kill Switch Password!');
    }
});
