from django.shortcuts import render_to_response
from django.template import RequestContext
from subprocess import Popen, PIPE, STDOUT
from django.http import HttpResponse

def handler404(request, *args, **argv):
    response = render_to_response('404.html', {},
                                  context_instance=RequestContext(request))
    response.status_code = 404
    return response

def load_perl(request):
    if request.method == 'POST':
            command = ["perl","your_script_path.pl"]
            try:
                    process = Popen(command, stdout=PIPE, stderr=STDOUT)
                    output = process.stdout.read()
                    exitstatus = process.poll()
                    if (exitstatus==0):
                            result = {"status": "Success", "output":str(output)}
                    else:
                            result = {"status": "Failed", "output":str(output)}

            except Exception as e:
                    result =  {"status": "failed", "output":str(e)}

            html = "<html><body>Script status: %s \n Output: %s</body></html>" %(result['status'],result['output'])
            return HttpResponse(html)