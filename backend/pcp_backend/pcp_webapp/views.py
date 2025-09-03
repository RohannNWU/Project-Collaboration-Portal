# Francois Verster 40723380
from django.shortcuts import render
from django.contrib import messages

# Create your views here.
def login_request(request):
    return render(request, 'login.html')

def login_handler(request):
    user = request.POST.get('email_address')
    password = request.POST.get('user_password')
    print("User: ", user)
    print("Password: ", password)
    if (user == 'admin@email.com' and password == 'password'):
        return render(request, 'landingpage.html')
    else:
        messages.error(request, 'Invalid email and password combination')
        return render(request, 'login.html')
    
def landing_page(request):
    return render(request, 'landingpage.html')