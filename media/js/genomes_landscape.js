function get_exp_data(){
    choice = $('#experiments_list').val();
    $.ajax({
        type: "POST",
        url: "fit_distribution/",
        data: {'choice' : choice},
        beforeSend: function() {
          $("#plots").html("<p>loading</p>");
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
      url: "get__experiment_landscape/",
      data: {'choice' : choice},
      beforeSend: function() {
        $("#landscape").html("<p>loading</p>");
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
      url: "download_dataset/",
      data: {'exp_id' : choice},
      success: function(response){
        data = "data:text/csv;charset=utf-8," + response.map(e => e.join(";")).join("\n");
        textFile = encodeURI(data)
        $('#download').html('<a id = "dwn_link">Download dataset</a>')
        $('#dwn_link').attr("href", textFile)
        $('#dwn_link').attr("download", "output.csv")

      }
    })
}

function load_experiments(){
    $.ajax({
        type: "POST",
        url: "exp_list/",
        success: function(response){
            html = '<select class = "form-control" id = "experiments_list" onchange = "get_exp_data()">'
            $.each(response, function(index, val) {
                html += '<option value = '+val[0]+'>'+val[1]+' </option>'
              });
            html += '</select>'
            $('#experiments').html(html)
        }
      })
}