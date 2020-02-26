function get_exp_data(){
    choice = $('#experiments_list').val();
    $.ajax({
        type: "POST",
        url: "fit_distribution/",
        data: {'choice' : choice},
        beforeSend: function() {
          $("#plots").html("<img style = 'margin: 50px 0 50px 0' src = '/media/images/loader.gif'/>");
        },
        success: function(response){
           $("#plots").html('');
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
                title: 'Phenotype distribution',
                height: 600,
                font: {size: 12},
                xaxis: {
                  title: 'Fitness'
                },
                yaxis: {
                  title: 'Genotypes count'
                },
              };
            var config = {responsive: true}
            Plotly.newPlot('plots', hist, layout, config );
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
      url: "average_fitness/",
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
            
            Plotly.newPlot('average', data, layout);
      }
    })

    $.ajax({
      type: "POST",
      url: "max_fitness/",
      data: {'choice' : choice},
      beforeSend: function() {
        $("#max_fitness").html("<img style = 'margin: 50px 0 50px 0' src = '/media/images/loader.gif'/>");
      },
      success: function(response){
          $("#max_fitness").html('')
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
            
            
            Plotly.newPlot('max_fitness', data, layout);
      }
    })

    $.ajax({
      type: "POST",
      url: "download_dataset/",
      data: {'choice' : choice},
      success: function(response){
        var blob = new Blob([response.map(e => e.join(";")).join("\n")], { type: 'text/csv;charset=utf-8;' });
        textFile = URL.createObjectURL(blob)
        $('#download').html('<a id = "dwn_link">Download dataset</a>')
        $('#dwn_link').attr("href", textFile)
        $('#dwn_link').attr("download", "output.csv")
        $('#dwn_link').attr("target", "_blank")

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