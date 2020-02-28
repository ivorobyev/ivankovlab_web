function get_exp_data(){
    choice = $('#experiments_list').val();
    $('#extend').remove()

    $.ajax({
      type: "POST",
      url: "get_experiment_summary/",
      data: {'choice' : choice},
      beforeSend: function() {
        $("#summary").html("<img style = 'margin: 50px 0 50px 0' src = '/media/images/loader.gif'/>");
      },
      success: function(response){
        if (response[0][0] == null){
          seq = "wild type sequence not found"
        }
        else {
          seq = "<div class = 'sequence'><p>"+"&nbsp;".repeat(response[0][1].toString().length-1) + "1&nbsp;"
          positions = response[0][4].split(',').map(numStr => parseInt(numStr));
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
          seq+= "<br/><span style = 'font-size: 11px'>* red color means mutated positions</span></p></div>"
        }

        $("#summary").html("<div class = 'row'><div class = 'col-md-3'>Sequence length</div><div class = 'col-md-5'>"+response[0][1]+"</div></div>\
                            <div class = 'row'><div class = 'col-md-3'>Phenotype value</div><div class = 'col-md-5'>"+response[0][2]+"</div></div>\
                            <div class = 'row'><div class = 'col-md-12'>"+seq+"</div></div>")
      }
    })
    
    $.ajax({
        type: "POST",
        url: "fit_distribution/",
        data: {'choice' : choice},
        beforeSend: function() {
          $('#click_stat').html('')
          $("#plots").html("<img style = 'margin: 50px 0 50px 0' src = '/media/images/loader.gif'/>");
        },
        success: function(response){
           $("#plots").html('');
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
                title: 'Phenotype distribution',
                height: 600,
                font: {size: 12},
                xaxis: {
                  title: 'Fitness'
                },
                yaxis: {
                  title: 'Genotypes count'
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
              };


            var config = {responsive: true}
            Plotly.newPlot('plots', hist, layout, config );
            $("#click_stat").append("<p style = 'margin-top:250px'>&lArr; Choose fitness in penotype distribution</p>")

            plots_dist .on('plotly_click', function(data){
              for(var i=0; i < data.points.length; i++){
                val = data.points[i].x
              };
              single_mutation_for_fitness(val)
            })
        }
    })

    $.ajax({
      type: "POST",
      url: "get_mutation_distribution/",
      data: {'choice' : choice},
      beforeSend: function() {
        $("#mutations").html("<img style = 'margin: 50px 0 50px 0' src = '/media/images/loader.gif'/>");
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
                type: 'bar'
              }
            ];

          var layout = { 
              title: 'Mutations count distribution',
              font: {size: 12},
              xaxis: {
                title: 'Mutations count'
              },
              yaxis: {
                title: 'Genotypes count'
              },
            };
          var config = {responsive: true}
          Plotly.newPlot('mutations', hist, layout, config );
      }
    })

    $.ajax({
      type: "POST",
      url: "get_experiment_landscape/",
      data: {'choice' : choice},
      beforeSend: function() {
        $("#landscape").html("<img style = 'margin: 50px 0 50px 0' src = '/media/images/loader.gif'/>");
      },
      success: function(response){
          $("#landscape").html('')
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
              title: 'Landscape',
              height: 600,
              scene: {
                xaxis:{title: 'Position'},
                yaxis:{title: 'Fitness'},
                zaxis:{title: 'Genotypes count'},
                },
              font: {size: 12}
            };

          var config = {responsive: true}  
          Plotly.newPlot('landscape', hist, layout, config );
      }
    })

    $.ajax({
      type: "POST",
      url: "single_mutants_fitness/",
      data: {'choice' : choice},
      beforeSend: function() {
        $("#average").html("<img style = 'margin: 50px 0 50px 0' src = '/media/images/loader.gif'/>");
      },
      success: function(response){
          $("#average").html('')
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
              title: 'Single mutations fitness',
              height: 600,
              xaxis: {
                title: 'Position',
                type: 'category'
              },
              yaxis: {
                title: 'Amino acid',
                categoryorder: 'category descending'
              },
            };
            
            Plotly.newPlot('average', data, layout);
      }
    })

    $.ajax({
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

    $('#res').append('<div id = "extend"><h3>Extended graphs</h3></div>')
    $('#extend').append('<div class = "graph-block bt" id = "max_fitness_heatmap"><button onclick = "max_fitness_heatmap()">Max fitness heatmap</button></div>\
                         <div class = "graph-block bt" id = "average_fitness_heatmap"><button onclick = "average_fitness_heatmap()">Average fitness heatmap</button></div>')
}

function max_fitness_heatmap(){
    choice = $('#experiments_list').val();
    $('#max_fitness_heatmap').html()
    $.ajax({
      type: "POST",
      url: "max_fitness/",
      data: {'choice' : choice},
      beforeSend: function() {
        $("#max_fitness_heatmap").html("<img style = 'margin: 50px 0 50px 0' src = '/media/images/loader.gif'/>");
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
                type: 'category'
              },
              yaxis: {
                title: 'Amino acid',
                categoryorder: 'category descending'
              },
            };
            
            Plotly.newPlot('max_fitness_heatmap', data, layout);
      }
    })
}

function average_fitness_heatmap(){
  choice = $('#experiments_list').val();
  $.ajax({
    type: "POST",
    url: "average_fitness/",
    data: {'choice' : choice},
    beforeSend: function() {
      $("#average_fitness_heatmap").html("<img style = 'margin: 50px 0 50px 0' src = '/media/images/loader.gif'/>");
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
              type: 'category'
            },
            yaxis: {
              title: 'Amino acid',
              categoryorder: 'category descending'
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
          $("#experiments").html("<img style = 'margin: 50px 0 50px 0' src = '/media/images/loader.gif'/>");
        },
        success: function(response){
            html = '<select class = "form-control" id = "experiments_list" onchange = "get_exp_data()">'
            html += '<option disabled selected value> -- select an option -- </option>'
            $.each(response, function(index, val) {
                html += '<option value = '+val[0]+'>'+val[1]+' </option>'
              });
            html += '</select>'
            $('#experiments').html(html)
        }
      })
}

function single_mutation_for_fitness(fitness){
  $.ajax({
    type: "POST",
    url: "single_mutants_fitness/",
    data: {'choice' : choice, 'fitness':fitness},
    beforeSend: function() {
      $("#click_stat").html("<img style = 'margin: 50px 0 50px 0' src = '/media/images/loader.gif'/>");
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
              type: 'category'
            },
            yaxis: {
              title: 'Amino acid',
              categoryorder: 'category descending'
            },
          };
          
          Plotly.newPlot('click_stat', data, layout);
    }
  })
}