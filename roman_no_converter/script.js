document.addEventListener('DOMContentLoaded', function()){
    const romanInput = document.getElementById('romanInput');
    const convertBtn = document.getElementById('convertBtn');
    const resultDiv = document.getElementById('result');

    convertBtn.addEventListener('click', function(){
        const romanNumeral = romanInput.value.trim().toUpperCase();

        if(!romanNumeral){
            showResult('Please enter the Roman numberal', error );
            return;

        }
    })
}
