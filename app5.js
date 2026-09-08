// Small corrections after the map layer.
STOCK.kitchen.forEach(x=>{if(x.block==='Закуски')x.block='Холодные закуски';if(x.block==='Паста')x.block='Горячие блюда'});
STOCK.bar.forEach(x=>{if(x.block==='Классика'||x.block==='Авторские')x.block='Коктейли'});
const _openEmployeeForm=openEmployeeForm;
openEmployeeForm=function(id=null){_openEmployeeForm(id);if(id){const buttons=[...document.querySelectorAll('#modalWrap .danger')];buttons.forEach(b=>{if(b.textContent.trim()==='Удалить')b.textContent='Архивировать'})}}
const _saveEmployee=saveEmployee;
saveEmployee=function(id){const el=document.getElementById('empPin');if(el){const pin=el.value.replace(/\D/g,'').slice(0,4);el.value=pin;if(pin.length!==4){alert('PIN должен состоять из 4 цифр');return}}_saveEmployee(id)}
render();