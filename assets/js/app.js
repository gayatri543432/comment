const cl=console.log;

const commentForm=document.getElementById('commentForm')
const nameControl=document.getElementById('name')
const emailControl=document.getElementById('email')
const bodyControl=document.getElementById('body')
const postIdControl=document.getElementById('postId')
const addBtn=document.getElementById('addBtn')
const updateBtn=document.getElementById('updateBtn')
const commentContainer=document.getElementById('commentContainer')
const spinner=document.getElementById('spinner')


let commentArr=[];

let BASE_URL='https://jsonplaceholder.typicode.com'
let POST_URL=`${BASE_URL}/comments`

function snackbar(msg,i){
    Swal.fire({
        title:msg,
        icon:i,
        timer:3000
    })
}

function tooltips(){
      $('[data-toggle="tooltip"]').tooltip()
}

function makeApiCall(method,api_url,body=null,successCb,errorCb){
    spinner.classList.remove('d-none')

    let xhr=new XMLHttpRequest()
    xhr.open(method,api_url)
    xhr.setRequestHeader('Content-Type','application/json;charset=UTF-8')
    xhr.send(body?JSON.stringify(body):null)
    xhr.onload=function(){
        if(xhr.status>=200 && xhr.status<=299){
            let res=JSON.parse(xhr.response)
            if(method==='GET' && Array.isArray(res)){
                successCb(res.reverse() )
            }else if(method==='POST'){
                successCb(body,res.id)
            }else if(method==='GET' || method==='PATCH' || method==='PUT'){
                successCb(res)
            }else{
                successCb()
            }        
        }else{
            errorCb(xhr.response)

        }

        spinner.classList.add('d-none')
    
    }
    xhr.onerror=function(){
        spinner.classList.add('d-none')
         errorCb('Network Error')
    }
}


function templating(arr){
    let res=''
    arr.forEach(p=>{
        res+=`<div class="col-md-3 mt-5" id="${p.id}">
                <div class="card h-100">
                    <div class="card-header"   data-toggle="tooltip" data-placement="top" title="${p.name}">
                        <h3>${p.name}</h3>
                    </div>
                    <div class="card-body">
                        <h5>Email: ${p.email}</h5>
                        <p>${p.body}</p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <i class="fa-solid fa-pen-to-square fa-2x text-primary"
                        onclick="onEdit(this)"></i>
                        <i class="fa-solid fa-trash-can fa-2x text-danger"
                        onclick="onRemove(this)"></i>
                    </div>
                </div>
            </div>`
    })
    commentContainer.innerHTML=res
    tooltips()
}

makeApiCall('GET',POST_URL,null,templating,snackbar)

function onSubmit(ele){
    ele.preventDefault()
    let New_comment={
        name:nameControl.value,
        email:emailControl.value,
        body:bodyControl.value,
        postId:postIdControl.value
    }

    makeApiCall('POST',POST_URL,New_comment,createNewCard,snackbar)
}

function createNewCard(res,i){
    let col=document.createElement('div');
    col.className='col-md-3 mt-5'
    col.id=i
    col.innerHTML=`<div class="card h-100">
                    <div class="card-header"  data-toggle="tooltip" data-placement="top" title="${res.name}">
                        <h3>${res.name}</h3>
                    </div>
                    <div class="card-body">
                        <h5>Email: ${res.email}</h5>
                        <p>${res.body}</p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <i class="fa-solid fa-pen-to-square fa-2x text-primary"
                        onclick="onEdit(this)"></i>
                        <i class="fa-solid fa-trash-can fa-2x text-danger"
                        onclick="onRemove(this)"></i>
                    </div>
                </div>`

        commentContainer.prepend(col);
        commentForm.reset ()
        tooltips()
        snackbar(`New Comment ${col.id} added successfully`,'success')
}

function onRemove(ele){
    let REMOVE_ID=ele.closest('.col-md-3').id
    localStorage.setItem('REMOVE_ID',REMOVE_ID)
    
    Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!"
    }).then((result) => {
    if (result.isConfirmed) {
        let REMOVE_URL=`${BASE_URL}/comments/${REMOVE_ID}`
        makeApiCall('DELETE',REMOVE_URL,null,removeOnUi,snackbar)
    }
    });

}

function removeOnUi(){
    let remove_id=localStorage.getItem('REMOVE_ID')
    document.getElementById(remove_id).remove()
    snackbar(`Comment with id ${remove_id} deleted ..`,'success')
}

function onEdit(ele){
    let EDIT_ID=ele.closest('.col-md-3').id
    localStorage.setItem('EDIT_ID',EDIT_ID)
    let EDIT_URL=`${BASE_URL}/comments/${EDIT_ID}`

    makeApiCall('GET',EDIT_URL,null,patchData,snackbar)
}

function patchData(res){
    nameControl.value=res.name
    emailControl.value=res.email
    bodyControl.value=res.body
    postIdControl.value=res.postId

    commentForm.scrollIntoView({
        behavior:'smooth',
        block:'center'
    })

    addBtn.classList.add('d-none')
    updateBtn.classList.remove('d-none')


}

function onUpdate(){
    let UPDATE_ID=localStorage.getItem('EDIT_ID')
    let Update_url=`${BASE_URL}/comments/${UPDATE_ID}`
    let update_comment={
        name:nameControl.value,
        email:emailControl.value,
        body:bodyControl.value,
        postId:postIdControl.value,
        id:UPDATE_ID
    }

    makeApiCall('PATCH',Update_url,update_comment,updateonUi,snackbar)
}

function updateonUi(res){
    let col=document.getElementById(res.id)
    col.querySelector('.card-header h3').innerHTML=res.name;
    col.querySelector('.card-body h5').innerHTML=`Email:${res.email}`
    col.querySelector('.card-body p').innerHTML=res.body

    let header=col.querySelector('.card-header');
    header.setAttribute('title',res.name);
    $(header).tooltip('dispose');
    $(header).tooltip();

    col.classList.add('bg')
    col.scrollIntoView({
        behavior:'smooth',
        block:'center'
    })

    setTimeout(() => {
        col.classList.remove('bg')
        
    }, 3000);
    commentForm.reset()
    addBtn.classList.remove('d-none')
    updateBtn.classList.add('d-none')
    snackbar(`Comment with ID ${res.id} updated.. `,'success')
}
commentForm.addEventListener('submit',onSubmit)
updateBtn.addEventListener('click',onUpdate)