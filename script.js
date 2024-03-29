const exec = require('child_process').exec;

exec('git add .', (err, stdout, stderr) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log('Arquivos adicionados ao staging area');

    exec('git commit -m "Atualização automática"', (err, stdout, stderr) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('Commit realizado com sucesso!');
    });
    exec('git status', (err, stdout, stderr) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('git status');
    });
});
