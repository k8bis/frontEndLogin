$(document).ready(function() {
    var url = 'http://192.168.0.17:3001/test'
    $('#dataTable').DataTable({
        "ajax":{
            "url":url,
            "dataSrc":""
        },
        "columns":[
            {"data":"idtickets"},
            {"data":"ticketsFechaAlta"},
            {"data":"nombresAlta"},
            {"data":"ticketsDescripcion"},
        ],
        "columnDefs":[
            {
                targets: 0,
                className:'dt-body-center',
                width: "5%"
            },
            {
                targets: 1,
                width: "25%"
            },
            {
                targets: 2,
                width: "20%"
            },
            {
                targets: 3,
                width: "50%"
            },
        ],
        language: {
            "decimal": "",
            "emptyTable": "No hay información",
            "info": "Mostrando _START_ a _END_ de _TOTAL_ Entradas",
            "infoEmpty": "Mostrando 0 to 0 of 0 Entradas",
            "infoFiltered": "(Filtrado de _MAX_ total entradas)",
            "infoPostFix": "",
            "thousands": ",",
            "lengthMenu": "Mostrar _MENU_ Entradas",
            "loadingRecords": "Cargando...",
            "processing": "Procesando...",
            "search": "Buscar:",
            "zeroRecords": "Sin resultados encontrados",
            "paginate": {
                "first": "Primero",
                "last": "Ultimo",
                "next": "Siguiente",
                "previous": "Anterior"
            }
        },
    });
});