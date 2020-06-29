function get_colorscale(min, max, wt){
          function change_color(color, steps){
            $.each(color, function(index, val) {
              color[index] = steps[index] + color[index]
            });
            return color;
          }

          to_mid = Math.abs(wt - min)
          amplitude = Math.abs(max - min)
          mid_percent = parseFloat((to_mid/amplitude).toFixed(2))
          rate = mid_percent*100

          blue = [0,0,255]
          grey = [220,220,220]
          red = [255,0,0]
          
          blue_grey_steps = blue.map(function(x) {return Math.floor((220 - x)/rate)})

          var scale = []

          for (var i = 0; i <= mid_percent; i+=0.01) {
            blue_fake = blue.map(function(x) {return Math.ceil(x)})
            scale.push([parseFloat(i.toFixed(2)), 'rgb(' + blue_fake.join(', ') + ')']);
            scale.push([parseFloat((i+0.01).toFixed(2)), 'rgb(' + blue_fake.join(', ') + ')']);
            blue = change_color(blue, blue_grey_steps)
          }

          grey_red_steps = red.map(function(x) {return Math.floor((x-220)/(100-rate))})
          grey = change_color(grey, grey_red_steps)

          for (var i = mid_percent; i < 1; i+=0.01) {
            grey_fake = grey.map(function(x) {return Math.ceil(x)})
            scale.push([parseFloat(i.toFixed(2)), 'rgb(' + grey_fake.join(', ') + ')']);
            scale.push([parseFloat((i+0.01).toFixed(2)), 'rgb(' + grey_fake.join(', ') + ')']);
            grey = change_color(grey, grey_red_steps)
          }

          return scale;
}

function get_exp_data(choice){
    $('#extend').remove()
    $("#loading").css("display", "block");
    $('.collapse').collapse('hide')

    var ex_summary = $.ajax({
      type: "POST",
      url: "get_experiment_summary/",
      data: {'choice' : choice},
      beforeSend: function() {
        $("summary").html("")
      },
      success: function(response){
        if (response[0][0] == null){
          seq = "wild type sequence not found"
        }
        else {
          seq = "<div class = 'sequence'><p>"+"&nbsp;".repeat(response[0][1].toString().length-1) + "1&nbsp;"
          positions = response[0][5].split(',').map(numStr => parseInt(numStr));
          $.each(response[0][0].split(''), function(index, val) {
              if (positions.includes(index+1)) {
                seq+= "<span style = 'color: red;'>"+val+"</span>"
              }
              else {
                seq+=val
              }

              if ((index+1) % 50 == 0){
                free_levels = response[0][1].toString().length - (index+2).toString().length
                seq += "<br/>" + "&nbsp;".repeat(free_levels) + (index+2) + "&nbsp;"
              }
              else if ((index+1) % 10 == 0){
                seq+="&nbsp;"
              }
          });
          seq += "<br/><span style = 'font-size: 11px; color: red'>* red color means mutated positions</span></p></div>"
        }
        
        phenotype_name = response[0][3] == null ? "&mdash;" : response[0][3];
        $("#summary").html("<div class = 'row'><div class = 'col-md-3'>Sequence length</div><div class = 'col-md-5'>"+response[0][1]+"</div></div>\
                            <div class = 'row'><div class = 'col-md-3'>Phenotye name</div><div class = 'col-md-5'>"+phenotype_name+"</div></div>\
                            <div class = 'row'><div class = 'col-md-3'>Wild-type phenotype level</div><div class = 'col-md-5'>"+response[0][2]+"</div></div>\
                            <div class = 'row'><div class = 'col-md-3'>Full name</div> <div class = 'col-md-5'>"+response[0][7]+"</div></div>\
                            <div class = 'row'><div class = 'col-md-3'>Taxon ID</div> <div class = 'col-md-5'><a href = https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id="+response[0][8]+" target = '_blank'>"+response[0][8]+"</a></div></div>\
                            <div class = 'row'><div class = 'col-md-3'>Year</div> <div class = 'col-md-5'>"+response[0][9]+"</div></div>\
                            <div class = 'row'><div class = 'col-md-3'>Publication</div> <div class = 'col-md-5'>"+response[0][10]+"</div></div>\
                            <div class = 'row'><div class = 'col-md-3'>Uniprot</div> <div class = 'col-md-5'><a href = https://www.uniprot.org/uniprot/"+response[0][11]+" target = '_blank'>"+response[0][11]+"</a></div></div>\
                            <div class = 'row'><div class = 'col-md-12'>"+seq+"</div></div>")

        pdb_id = response[0][6].slice(0, response[0][6].length - 2)
        $("#page-title").html(response[0][7])

        var plugin = LiteMol.Plugin.create({target: '#structure',
                                            viewportBackground: '#fff',
                                            layoutState: {
                                              hideControls: true
                                            },
                                            });

        plugin.loadMolecule({
          id: '1tqn',
          url: 'https://www.ebi.ac.uk/pdbe/entry-files/download/pdb'+pdb_id.toLowerCase()+'.ent',
          format: 'pdb'
        });
      }
    })
    
    var fit_distribution =  $.ajax({
        type: "POST",
        url: "fit_distribution/",
        data: {'choice' : choice},
        beforeSend: function() {
          $("#plots").html("");
        },
        success: function(response){
           $("#plots").html('');
           $('#click_stat').html("")
            x_ = []
            y_ = []
            wt = response[0][2]
            $.each(response, function(index, val) {
                x_.push(val[0])
                y_.push(parseInt(val[1]))
              });

            var plots_dist = document.getElementById("plots"),
            hist = [
                {
                  x: x_,
                  y: y_,
                  type: 'bar'
                }
              ],

            layout = { 
                title: "<b>Phenotype distribution</b> <br> The distribution of phenotype effects across all studied genotypes.<br> Red line shows wild-type phenotype.",
                height: 570,
                font: {size: 12},
                xaxis: {
                  title: 'Fitness'
                },
                yaxis: {
                  title: 'Genotypes count'
                },
                margin: {
                  t: 150
                },
                shapes: [
                  {
                    type: 'line',
                    x0: wt,
                    y0: 0,
                    x1: wt,
                    y1: Math.max(...y_),
                    line: {
                      color: 'red',
                      width: 1
                    }
                  }
                ]
              }

            var config = {responsive: true}
            Plotly.newPlot('plots', hist, layout, config );
            $("#click_stat").append("<p style = 'margin-top:250px'>&lArr; Choose fitness in penotype distribution</p>")

            plots_dist .on('plotly_click', function(data){
              for(var i=0; i < data.points.length; i++){
                val = data.points[i].x
              };
              single_mutation_for_fitness(val, choice)
            })
        }
    })

    var get_mutation_distribution =  $.ajax({
      type: "POST",
      url: "get_mutation_distribution/",
      data: {'choice' : choice},
      beforeSend: function() {
        $("#mutation").html("")
      },
      success: function(response){
         $("#mutations").html('');
          x_ = []
          y_ = []
          $.each(response, function(index, val) {
              x_.push(val[0])
              y_.push(val[1])
            });

          var hist = [
              {
                x: x_,
                y: y_,
                type: 'bar',
                text: y_.map(String),
                textposition: 'auto',
                hoverinfo: 'none',
              }
            ];

          var layout = { 
              title: '<b>Mutations count distribution</b> <br> The distribution of the number<br> of introduced amino acid mutations across all studied genotypes',
              height: 570,
              font: {size: 12},
              xaxis: {
                title: 'Mutations count'
              },
              yaxis: {
                title: 'Genotypes count'
              },
              margin: {
                t: 150
              }
            };
          var config = {responsive: true}
          Plotly.newPlot('mutations', hist, layout, config );
      }
    })

    var get_experiment_landscape = $.ajax({
      type: "POST",
      url: "get_experiment_landscape/",
      data: {'choice' : choice},
      beforeSend: function() {
        $("#landscape").html("")
      },
      success: function(response){
          x_ = []
          y_ = []
          z_ = []
          $.each(response, function(index, val) {
              x_.push(parseInt(val[0]))
              y_.push(parseFloat(val[1]))
              z_.push(val[2])
            });

          var hist = [
              {
                x: x_,
                y: y_,
                z: z_,
                type: 'mesh3d',
                intensity: z_,
                colorscale: 'Earth'
              }
            ];

          var layout = { 
              title: "<b>Landscape</b> <br> Position-specific distribution of phenotype effects. <br>For each protein position all genotypes with a mutation in this position were grouped.<br> The distribution of phenotypes across them is shown.<br>",
              height: 570,
              scene: {
                xaxis:{title: 'Position'},
                yaxis:{title: 'Fitness'},
                zaxis:{title: 'Genotypes count'},
                },
                margin: {
                  t: 150
                },
              font: {size: 12},
            };

          var config = {responsive: true}  
          Plotly.newPlot('landscape', hist, layout, config );
      }
    })

    var single_mutants_fitness = $.ajax({
      type: "POST",
      url: "single_mutants_fitness/",
      data: {'choice' : choice},
      beforeSend: function() {
        $("#average").html("")
      },
      success: function(response){
          x_ = []
          y_ = []
          z_ = []
          $.each(response, function(index, val) {
              x_.push(val[0])
              y_.push(val[1])
              z_.push(val[2])
          });
          
          var data = [{
              x: x_,
              y: y_,
              z: z_,
              colorscale: get_colorscale(Math.min(...z_), Math.max(...z_), response[0][3]),
              type: 'heatmap',
              hoverongaps: false
          }];
            
          var layout = {
              title: 'Single mutations fitness',
              height: 600,
              xaxis: {
                title: 'Position',
                type: 'category',
                showgrid: false
              },
              yaxis: {
                title: 'Amino acid',
                categoryorder: 'category descending',
                showgrid: false
              },
              annotations: [{
                text: "",
                  font: {
                  size: 13,
                  color: 'rgb(116, 101, 130)',
                },
                showarrow: false,
                align: 'center',
                x: 0.5,
                y: 1.1,
                xref: 'paper',
                yref: 'paper',
            }]
          };
          var config = {responsive: true}  
          Plotly.newPlot('average', data, layout, config);
      },
      error: function(response){
        $("#average").html('<p>Error</p>')
        return 0;
      }
    })

    var download_dataset = $.ajax({
      type: "POST",
      url: "download_dataset/",
      data: {'choice' : choice},
      success: function(response){
        var blob = new Blob([response.map(e => e.join(";")).join("\n")], {type: 'text/csv;charset=utf-8;' });
        textFile = URL.createObjectURL(blob)
        $('#download').html('<a id = "dwn_link">Download dataset</a>')
        $('#dwn_link').attr("href", textFile)
        $('#dwn_link').attr("download", "output.csv")
        $('#dwn_link').attr("target", "_blank")
      }
    })

    $.when(ex_summary, fit_distribution, get_mutation_distribution, get_experiment_landscape, single_mutants_fitness, download_dataset).then(function(){
      $("#loading").css("display", "none");
    })

    $('#res').append('<div id = "extend"><h3>Extended graphs</h3></div>')
    $('#extend').append('<div class = "graph-block bt" id = "max_fitness_heatmap"><button onclick = "max_fitness_heatmap('+choice+')">Max fitness heatmap</button></div>\
                         <div class = "graph-block bt" id = "average_fitness_heatmap"><button onclick = "average_fitness_heatmap('+choice+')">Average fitness heatmap</button></div>\
                         <div class = "graph-block bt" id = "mutations_violin"><button onclick = "mutations_violin('+choice+')">Mutations count violin plot</button></div>')
}

function max_fitness_heatmap(choice){
    $('#max_fitness_heatmap').html()
    $.ajax({
      type: "POST",
      url: "max_fitness/",
      data: {'choice' : choice},
      beforeSend: function() {
        $("#max_fitness_heatmap").html("<p>...</p>");
      },
      success: function(response){
          $("#max_fitness_heatmap").html('')
          x_ = []
          y_ = []
          z_ = []
          $.each(response, function(index, val) {
              x_.push(val[0])
              y_.push(val[1])
              z_.push(val[2])
            });

            var data = [{
              x: x_,
              y: y_,
              z: z_,
              type: 'heatmap'
            }];
            
            var layout = {
              title: 'Max fitness',
              height: 600,
              xaxis: {
                title: 'Position',
                type: 'category',
                showgrid: false
              },
              yaxis: {
                title: 'Amino acid',
                categoryorder: 'category descending',
                showgrid: false
              },
            };
            
            Plotly.newPlot('max_fitness_heatmap', data, layout);
      }
    })
}

function mutations_violin(choice){
  $.ajax({
    type: "POST",
    url: "mutations_violin/",
    data: {'choice' : choice},
    beforeSend: function() {
      $("#mutations_violin").html("<p>...</p>");
    },
    success: function(response){
        $("#mutations_violin").html('')
        x_ = []
        y_ = []
        $.each(response, function(index, val) {
            x_.push(val[0])
            y_.push(val[1])
          });

          var data = [{
            x: x_,
            y: y_,
            type: 'violin',
            meanline: {
              visible: true
            },
            box: {
              visible: true
            },
            x0: "Phenotype"

          }];
          
          var layout = {
            title: 'Mutations count violin plot',
            height: 600,
            xaxis: {
              title: 'Mutations count'
            },
            yaxis: {
              title: 'Phenotype',
              zeroline: false
            },
          };
          
          Plotly.newPlot('mutations_violin', data, layout);
    }
  })
}

function average_fitness_heatmap(choice){
  $.ajax({
    type: "POST",
    url: "average_fitness/",
    data: {'choice' : choice},
    beforeSend: function() {
      $("#average_fitness_heatmap").html("<p>...</p>");
    },
    success: function(response){
        $("#average_fitness_heatmap").html('')
        x_ = []
        y_ = []
        z_ = []
        $.each(response, function(index, val) {
            x_.push(val[0])
            y_.push(val[1])
            z_.push(val[2])
          });

          var data = [{
            x: x_,
            y: y_,
            z: z_,
            type: 'heatmap'
          }];
          
          var layout = {
            title: 'Average fitness',
            height: 600,
            xaxis: {
              title: 'Position',
              type: 'category',
              showgrid: false
            },
            yaxis: {
              title: 'Amino acid',
              categoryorder: 'category descending',
              showgrid: false
            },
          };
          
          Plotly.newPlot('average_fitness_heatmap', data, layout);
    }
  })
}

function load_experiments(){
    $.ajax({
        type: "POST",
        url: "exp_list/",
        beforeSend: function() {
          $("#experiments").html("<p>...</p>");
        },
        success: function(response){
            console.log(response)
            html = '<table class = "table" id = "myTable">'
            html += '<tr><th></th><th width = 60%><input type="text" id="myInput" onkeyup="myFunction()" placeholder="Search..." title="Type in a name"></th> <th></th></tr>'
            $.each(response, function(index, val) {
              html += '<tr><td width = 20%>'
              $.each(val, function(index, value) {
                html += `<p><a href = 'inner?prot=`+value[0]+`' target = '_blank'> `+value[10]+`</a></p>`
              });
              html += '</td>'

              html += `
                      <td width = 60%>
                            <p><a href = `+val[0][8]+` target = '_blank'>`+val[0][3]+`.</br> `+val[0][2]+` `+val[0][4]+` `+ val[0][5]+` `+val[0][6]+` `+val[0][7]+`</a></p>
                            <p>PMID: <a href = 'https://www.ncbi.nlm.nih.gov/pubmed/`+ val[0][9]+`' target = '_blank'>`+val[0][9]+`</a></p>
                            <p>`+val[0][11]+`</p>
                      </td>
                      <td width = 20%>
                            <p>`+val[0][13]+`: <a href = 'https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=`+val[0][12]+`' target = '_blank'>`+val[0][12]+`</a></p>
                      </td>
                      `                
                html += `</tr>` 
              });
            html += '</table>'
            $('#experiments').html(html)
        }
      })
}

function myFunction() {
  var input, filter, table, tr, td, i, txtValue;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  table = document.getElementById("myTable");
  tr = table.getElementsByTagName("tr");
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[1];
    if (td) {
      txtValue = td.textContent || td.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }       
  }
}

function single_mutation_for_fitness(fitness, choice){
  $.ajax({
    type: "POST",
    url: "single_mutants_fitness/",
    data: {'choice' : choice, 'fitness':fitness},
    beforeSend: function() {
      $("#click_stat").html("<p style = 'margin-top: 50px'>Please wait</p>");
    },
    success: function(response){
        $("#click_stat").html('')
        x_ = []
        y_ = []
        z_ = []
        $.each(response, function(index, val) {
            x_.push(val[0])
            y_.push(val[1])
            z_.push(val[2])
          });

          var data = [{
            x: x_,
            y: y_,
            z: z_,
            type: 'heatmap',
            hoverongaps: false
          }];
          
          var layout = {
            title: 'Single mutations for fitness near '+fitness+' value',
            height: 600,
            xaxis: {
              title: 'Position',
              type: 'category',
              showgrid: false
            },
            yaxis: {
              title: 'Amino acid',
              categoryorder: 'category descending',
              showgrid: false
            },
          };
          Plotly.newPlot('click_stat', data, layout);
    },
  error: function(response){
          $("#click_stat").html('<p>Error</p>')
  }
  
  })
}