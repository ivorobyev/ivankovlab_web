function load_mutations(){
    $.ajax({
        type: "POST",
        url: "get_mutations/",
        beforeSend: function() {
            $("#experiments").html("<p>...</p>");
        },
        success: function(response){
            //html = '<input type="text" id="myInput" onkeyup="search_table()" placeholder="Search..." title="Type in a name">'
            html = ''
            html += '<table class = "table table-fixed" id = "myTable">'
            html += `<thead><tr>
                     <th class="header" scope="col">Protein name</th><th class="header" scope="col">Sequence</th>
                     <th class="header" scope="col">Length</th><th class="header" scope="col">Uniprot id</th>
                     <th class="header" scope="col">PDB list</th><th class="header" scope="col">Mutation</th>
                     <th class="header" scope="col">TMDB id</th><th class="header" scope="col">Variation</th>
                     <th class="header" scope="col">T</th><th class="header" scope="col">ph</th>
                     <th class="header" scope="col">method</th><th class="header" scope="col">Conditions</th>
                     <th class="header" scope="col">DOI</th>
                     <th class="header" scope="col">Predictors</th>
                     <th class="header" scope="col">Datasets</th></tr></thead><tbody>`
            
            $.each(response, function(val) {
                seq = "<div class = 'sequence'><p>"
                $.each(response[val][1].split(''), function(index, ch) {
                    seq += ch

                    if ((index+1) % 30 == 0){
                      free_levels = response[0][1].toString().length - (index+2).toString().length
                      seq += "<br/>"
                    }
                    else if ((index+1) % 10 == 0){
                      seq+="&nbsp;"
                    }
                });
                seq += "</p></div>"
              
                pdb_l = ''
                $.each(response[val][3].split(','), function(index, ch) {
                  pdb_l +="<a target='_blank' href='https://www.rcsb.org/structure/"+ch+"'>"+ch+"</a><br/>"
                });
                
                preds_l = ''
                $.each(response[val][12].split(';'), function(index, ch) {
                  preds_l +="<a target='_blank' href='predictor?pred="+ch+"'>"+ch+"</a><br/>"
                });

                ds_l = ''
                $.each(response[val][13].split(';'), function(index, ch) {
                  ds_l +="<a target='_blank' href='dataset?ds="+ch+"'>"+ch+"</a><br/>"
                });

                html += `<tr><td id='p_name'>`+response[val][0]+`</td><td id='seq'>`+seq+`</td><td>`+response[val][1].length+`</td>
                             <td><a href = https://www.uniprot.org/uniprot/`+response[val][2]+` target = '_blank'>`+response[0][2]+`</a></td>
                             <td class='lst'>`+pdb_l+`</td><td>`+response[val][4]+`</td>
                             <td><a target='_blank' href='http://biosig.unimelb.edu.au/thermomutdb/details/id/`+response[val][5]+`'>`+response[val][5]+`</a></td>
                             <td>`+response[val][6]+`</td><td>`+response[val][7]+`</td>
                             <td id='ph'>`+response[val][8]+`</td><td>`+response[val][9]+`</td><td>`+response[val][10]+`</td>
                             <td><a target = '_blank' href = '`+response[val][11]+`'>`+response[val][11]+`</a></td>
                             <td class='lst'>`+preds_l+`</td><td class='lst'>`+ds_l+`</td>
                         </tr>`
                s = "<td><a target='_blank' href='http://biosig.unimelb.edu.au/thermomutdb/details/id/`+response[val][6]+`'>`+response[val][6]+`</a></td>"
              });
            html += '</tbody></table>'
            $('#experiments').html(html);
            $("#myTable").DataTable();
        }
      })
}

function get_pred_data(choice){
  $.ajax({
      type: "POST",
      url: "get_predictor_data/",
      data: {'choice' : choice},
      beforeSend: function() {
          $("#experiments").html("<p>...</p>");
      },
      success: function(response){
          $('h2').html(response[0][0]);
          $(document).attr("title", choice);
          $("#experiments").html("<div class='col-md-6' id='datasets'></div>");
          html = '<p>Used datasets</p>'
          $.each(response[0][2].split(';'), function(index, val) {
              html += "<p><a target='_blank' href=/datasets_db/dataset/?ds="+val+">"+val+"</a></p>"
          });
          $('#datasets').html(html);
          $("#experiments").append("<div class='col-md-6' id='pred_info'></div>")
          $("#pred_info").html("<p>"+response[0][1]+"</p>")
      }
    })
}

function get_dataset_data(choice){
  $.ajax({
    type: "POST",
    url: "get_dataset/",
    data: {'choice' : choice},
    beforeSend: function() {
        $("#experiments").html("<p>...</p>");
    },
    success: function(response){
        $('h2').html(choice);
        $(document).attr("title", choice);
        //html = '<input type="text" id="myInput" onkeyup="search_table()" placeholder="Search..." title="Type in a name">'
        html = ''
        html += '<table class = "table table-fixed" id = "myTable">'
        html += `<thead><tr>
                 <th class="header" scope="col">Protein name</th><th class="header" scope="col">Sequence</th>
                 <th class="header" scope="col">Length</th><th class="header" scope="col">Uniprot id</th>
                 <th class="header" scope="col">PDB list</th><th class="header" scope="col">Mutation</th>
                 <th class="header" scope="col">TMDB id</th><th class="header" scope="col">Variation</th>
                 <th class="header" scope="col">T</th><th class="header" scope="col">ph</th>
                 <th class="header" scope="col">method</th><th class="header" scope="col">Conditions</th></thead><tbody>`
        
        $.each(response, function(val) {
            seq = "<div class = 'sequence'><p>"
            $.each(response[val][1].split(''), function(index, ch) {
                seq += ch

                if ((index+1) % 30 == 0){
                  free_levels = response[0][1].toString().length - (index+2).toString().length
                  seq += "<br/>"
                }
                else if ((index+1) % 10 == 0){
                  seq+="&nbsp;"
                }
            });
            seq += "</p></div>"
          
            pdb_l = ''
            $.each(response[val][3].split(','), function(index, ch) {
              pdb_l +="<a target='_blank' href='https://www.rcsb.org/structure/"+ch+"'>"+ch+"</a><br/>"
            });
            

            html += `<tr><td>`+response[val][0]+`</td><td id='seq'>`+seq+`</td><td>`+response[val][1].length+`</td>
                         <td><a href = https://www.uniprot.org/uniprot/`+response[val][2]+` target = '_blank'>`+response[0][2]+`</a></td>
                         <td class='lst'>`+pdb_l+`</td><td>`+response[val][4]+`</td>
                         <td><a target='_blank' href='http://biosig.unimelb.edu.au/thermomutdb/details/id/`+response[val][5]+`'>`+response[val][5]+`</a></td>
                         <td>`+response[val][6]+`</td><td>`+response[val][7]+`</td>
                         <td id='ph'>`+response[val][8]+`</td><td>`+response[val][9]+`</td><td>`+response[val][10]+`</td>
                     </tr>`
            s = "<td><a target='_blank' href='http://biosig.unimelb.edu.au/thermomutdb/details/id/`+response[val][6]+`'>`+response[val][6]+`</a></td>"
          });
        html += '</tbody></table>'
        $('#experiments').html(html);
        $("#myTable").DataTable();
    }
  })
}
