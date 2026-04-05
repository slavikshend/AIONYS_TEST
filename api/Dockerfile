from mcr.microsoft.com/dotnet/aspnet:9.0 as base
workdir /app
expose 4758

from mcr.microsoft.com/dotnet/sdk:9.0 as build
workdir /app
copy api.csproj ./
run dotnet restore "api.csproj"
copy . .
run dotnet publish "api.csproj" -c Release -o /app/publish

from base as final
WORKDIR /apps
copy --from=build /app/publish ./
env ASPNETCORE_URLS=http://+:4758
entrypoint ["dotnet", "api.dll"]