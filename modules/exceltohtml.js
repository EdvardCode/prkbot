const { exec } = require('child_process');
const os = require('os');

module.exports = async (xlsxfilepath, outfile) => {
    return new Promise((resolve, reject) => {
        const pythonScriptPath = __dirname + "/python/run_xlsx2html.py";
        
        const pythonCommand = os.platform() === 'win32' ? 'python' : 'python3';
        
        const command = os.platform() === 'win32'
            ? `${pythonCommand} -X utf8 "${pythonScriptPath}" "${xlsxfilepath}" "${outfile}"`
            : `${pythonCommand} '${pythonScriptPath}' '${xlsxfilepath}' '${outfile}'`;
        
        exec(command, { maxBuffer: 1024 * 1024 * 64 }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Ошибка выполнения скрипта: ${error}`);
                reject(error);
                return;
            }
            resolve(stdout);
        });
    });
}